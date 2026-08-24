import { Types } from "mongoose";
import {
  IServiceHowItWorks,
  IServiceIncludedItem,
  IServiceInsuranceCoverage,
  IServiceFAQ,
  IServiceDisclaimer,
} from "@/database/service-informations/service-information-db-interface";

export interface ServiceInformationDTO {
  service_id: Types.ObjectId;
  how_it_works?: IServiceHowItWorks[];
  included_items?: IServiceIncludedItem[];
  insurance_coverage?: IServiceInsuranceCoverage;
  faqs?: IServiceFAQ[];
  disclaimers?: IServiceDisclaimer[];
}

export function toServiceInformationDTO(body: any): ServiceInformationDTO {
  return {
    service_id: new Types.ObjectId(body.service_id),
    how_it_works: (body.how_it_works || []).map((item: any) => ({
      step: Number(item.step),
      title: item.title?.trim(),
      description: item.description?.trim(),
      sort_order: Number(item.sort_order),
    })),
    included_items: (body.included_items || []).map((item: any) => ({
      title: item.title?.trim(),
      description: item.description?.trim() || "",
      sort_order: Number(item.sort_order),
    })),
    insurance_coverage: body.insurance_coverage
      ? {
          enabled: Boolean(body.insurance_coverage.enabled),
          title: body.insurance_coverage.title?.trim() || "",
          description: body.insurance_coverage.description?.trim() || "",
          coverage_items: body.insurance_coverage.coverage_items || [],
          disclaimer: body.insurance_coverage.disclaimer?.trim() || "",
          sort_order: Number(body.insurance_coverage.sort_order ?? 0),
        }
      : {
          enabled: false,
          coverage_items: [],
          sort_order: 0,
        },
    faqs: (body.faqs || []).map((item: any) => ({
      question: item.question?.trim(),
      answer: item.answer?.trim(),
      sort_order: Number(item.sort_order),
    })),
    disclaimers: (body.disclaimers || []).map((item: any) => ({
      title: item.title?.trim() || "",
      content: item.content?.trim(),
      sort_order: Number(item.sort_order),
    })),
  };
}

export function toUpdateServiceInformationDTO(body: any): Partial<Omit<ServiceInformationDTO, "service_id">> {
  const result: Partial<Omit<ServiceInformationDTO, "service_id">> = {};

  if (body.how_it_works !== undefined) {
    result.how_it_works = (body.how_it_works || []).map((item: any) => ({
      step: Number(item.step),
      title: item.title?.trim(),
      description: item.description?.trim(),
      sort_order: Number(item.sort_order),
    }));
  }

  if (body.included_items !== undefined) {
    result.included_items = (body.included_items || []).map((item: any) => ({
      title: item.title?.trim(),
      description: item.description?.trim() || "",
      sort_order: Number(item.sort_order),
    }));
  }

  if (body.insurance_coverage !== undefined) {
    result.insurance_coverage = {
      enabled: Boolean(body.insurance_coverage.enabled),
      title: body.insurance_coverage.title?.trim() || "",
      description: body.insurance_coverage.description?.trim() || "",
      coverage_items: body.insurance_coverage.coverage_items || [],
      disclaimer: body.insurance_coverage.disclaimer?.trim() || "",
      sort_order: Number(body.insurance_coverage.sort_order ?? 0),
    };
  }

  if (body.faqs !== undefined) {
    result.faqs = (body.faqs || []).map((item: any) => ({
      question: item.question?.trim(),
      answer: item.answer?.trim(),
      sort_order: Number(item.sort_order),
    }));
  }

  if (body.disclaimers !== undefined) {
    result.disclaimers = (body.disclaimers || []).map((item: any) => ({
      title: item.title?.trim() || "",
      content: item.content?.trim(),
      sort_order: Number(item.sort_order),
    }));
  }

  return result;
}
