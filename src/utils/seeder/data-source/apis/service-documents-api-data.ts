import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/service-document-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const serviceDocumentApiData = (): IAPI[] => [
    // create service document
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.ServiceDocuments,
        activity_name: activityName.createServiceDocument,
        activity_code: activityCode.createServiceDocument,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/service-documents",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [
            {
                key: "name",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "display_name",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "item_code",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "document_type_id",
                value: "string",
                type: datatypes.Object,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "max_file_size",
                value: "number",
                type: datatypes.Number,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "accepted_mimeTypes",
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

    // list service documents
    {
        activity_type: activityTypes.List,
        module: moduleTypes.ServiceDocuments,
        activity_name: activityName.listServiceDocuments,
        activity_code: activityCode.listServiceDocuments,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/service-documents",
        status: true,
        form_params: [],
        search_params: [
            ...defaultSearchParams,
            {
                title: "name_like",
                value: "name",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
                is_required: false,
            },
            {
                title: "display_name_like",
                value: "display_name",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
                is_required: false,
            },
            {
                title: "item_code",
                value: "item_code",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
                is_required: false,
            },
        ],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },

    // update service document
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.ServiceDocuments,
        activity_name: activityName.updateServiceDocument,
        activity_code: activityCode.updateServiceDocument,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/service-documents/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // delete service document
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.ServiceDocuments,
        activity_name: activityName.deleteServiceDocument,
        activity_code: activityCode.deleteServiceDocument,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/service-documents/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // activate service document
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.ServiceDocuments,
        activity_name: activityName.activateServiceDocument,
        activity_code: activityCode.activateServiceDocument,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/service-documents/:id/enable",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // deactivate service document
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.ServiceDocuments,
        activity_name: activityName.deactivateServiceDocument,
        activity_code: activityCode.deactivateServiceDocument,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/service-documents/:id/disable",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // show service document
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.ServiceDocuments,
        activity_name: activityName.showServiceDocument,
        activity_code: activityCode.showServiceDocument,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/service-documents/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {},
        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },
];

export default serviceDocumentApiData;
