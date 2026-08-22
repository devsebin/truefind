import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import {
    activityCode,
    activityName,
} from "../../activities/service-document-configuration-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const serviceDocumentConfigurationApiData = (): IAPI[] => [
    // Create / Store
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.ServiceDocumentConfigurations,
        activity_name: activityName.createServiceDocumentConfiguration,
        activity_code: activityCode.createServiceDocumentConfiguration,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/service-document-configurations",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [
            {
                key: "service_id",
                value: "string",
                type: datatypes.Object,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "required_documents",
                value: "array",
                type: datatypes.Array,
                required: true,
                parent: false,
                parent_key: "",
            },
        ],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // List
    {
        activity_type: activityTypes.List,
        module: moduleTypes.ServiceDocumentConfigurations,
        activity_name: activityName.listServiceDocumentConfigurations,
        activity_code: activityCode.listServiceDocumentConfigurations,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/service-document-configurations",
        status: true,
        form_params: [],
        search_params: [
            ...defaultSearchParams,
        ],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },

    // Show
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.ServiceDocumentConfigurations,
        activity_name: activityName.showServiceDocumentConfiguration,
        activity_code: activityCode.showServiceDocumentConfiguration,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/service-document-configurations/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },

    // Update
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.ServiceDocumentConfigurations,
        activity_name: activityName.updateServiceDocumentConfiguration,
        activity_code: activityCode.updateServiceDocumentConfiguration,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/service-document-configurations/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [
            {
                key: "required_documents",
                value: "array",
                type: datatypes.Array,
                required: true,
                parent: false,
                parent_key: "",
            },
        ],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // Delete
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.ServiceDocumentConfigurations,
        activity_name: activityName.deleteServiceDocumentConfiguration,
        activity_code: activityCode.deleteServiceDocumentConfiguration,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/service-document-configurations/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // Enable
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.ServiceDocumentConfigurations,
        activity_name: activityName.enableServiceDocumentConfiguration,
        activity_code: activityCode.enableServiceDocumentConfiguration,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/service-document-configurations/:id/enable",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // Disable
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.ServiceDocumentConfigurations,
        activity_name: activityName.disableServiceDocumentConfiguration,
        activity_code: activityCode.disableServiceDocumentConfiguration,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/service-document-configurations/:id/disable",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
];

export default serviceDocumentConfigurationApiData;
