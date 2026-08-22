import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";
import { ServiceUserDocumentConfigurationStatus } from "@/database/service-user-document-configuration/service-user-document-configuration-db-model";
import mongoose from "mongoose";
import createServiceUserDocumentConfigurationHelperService from "./create-service-user-document-configuration.helper.service";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export interface ServiceEligibilityEvaluation {
  serviceId: mongoose.Types.ObjectId;
  eligibilityStatus: "pending" | "success";
  requiredDocuments: Array<{
    documentRequirementId: mongoose.Types.ObjectId;
    isMandatory: boolean;
  }>;
}

class ProcessDocumentEligibilityHelperService {
  public async evaluateServicesEligibility(
    serviceIds: mongoose.Types.ObjectId[],
    session: mongoose.ClientSession,
  ): Promise<Map<string, ServiceEligibilityEvaluation>> {
    const docConfigs = await ServiceDocumentConfigurationModel.find({
      service_id: { $in: serviceIds },
      is_deleted: false,
      is_active: true,
    })
      .session(session)
      .lean();

    const configMap = new Map<string, any>();
    for (const cfg of docConfigs) {
      configMap.set(cfg.service_id.toString(), cfg);
    }

    const resultMap = new Map<string, ServiceEligibilityEvaluation>();

    for (const serviceId of serviceIds) {
      const sIdStr = serviceId.toString();
      const docConfig = configMap.get(sIdStr);

      const requiredDocuments: Array<{
        documentRequirementId: mongoose.Types.ObjectId;
        isMandatory: boolean;
      }> = [];

      if (docConfig && Array.isArray(docConfig.required_documents)) {
        for (const reqDoc of docConfig.required_documents) {
          if (
            reqDoc.document_id &&
            reqDoc.is_deleted !== true &&
            reqDoc.is_active !== false
          ) {
            requiredDocuments.push({
              documentRequirementId: new mongoose.Types.ObjectId(
                reqDoc.document_id.toString(),
              ),
              isMandatory: reqDoc.is_mandatory ?? true,
            });
          }
        }
      }

      const hasMandatoryDocuments = requiredDocuments.some((d) => d.isMandatory);
      const eligibilityStatus: "pending" | "success" = hasMandatoryDocuments
        ? "pending"
        : "success";

      resultMap.set(sIdStr, {
        serviceId,
        eligibilityStatus,
        requiredDocuments,
      });
    }

    return resultMap;
  }

  public async processAndPersistUserDocumentConfigurations(
    userId: mongoose.Types.ObjectId,
    evaluations: ServiceEligibilityEvaluation[],
    currentUserId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    const toCreate: Array<{
      serviceId: mongoose.Types.ObjectId;
      documentRequirementId: mongoose.Types.ObjectId;
      isMandatory: boolean;
      status?: ServiceUserDocumentConfigurationStatus;
    }> = [];

    for (const evalItem of evaluations) {
      for (const reqDoc of evalItem.requiredDocuments) {
        toCreate.push({
          serviceId: evalItem.serviceId,
          documentRequirementId: reqDoc.documentRequirementId,
          isMandatory: reqDoc.isMandatory,
          status: ServiceUserDocumentConfigurationStatus.PENDING,
        });
      }
    }

    if (toCreate.length > 0) {
      await createServiceUserDocumentConfigurationHelperService.bulkUpsert(
        userId,
        toCreate,
        currentUserId,
        session,
        dbTransactions,
        errorMap,
      );
    }
  }
}

export default new ProcessDocumentEligibilityHelperService();
