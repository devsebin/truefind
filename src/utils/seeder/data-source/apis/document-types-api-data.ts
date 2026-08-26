import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/document-types-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const documentTypesApiData = (): IAPI[] => [
    // create document type
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.DocumentTypes,
        activity_name: activityName.createDocumentTypes,
        activity_code: activityCode.createDocumentTypes,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/document-types",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [
            {
                key: "title",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "label",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "color",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "is_default",
                value: "boolean",
                type: datatypes.Boolean,
                required: false,
                parent: false,
                parent_key: "",
            },
        ],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // list document types
    {
        activity_type: activityTypes.List,
        module: moduleTypes.DocumentTypes,
        activity_name: activityName.listDocumentTypes,
        activity_code: activityCode.listDocumentTypes,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/document-types",
        status: true,
        form_params: [],
        search_params: [
            ...defaultSearchParams,
            {
                title: "title_like",
                value: "title",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
                is_required: false,
            },
            {
                title: "label",
                value: "label",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
                is_required: false,
            },
        ],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },

    // update document type
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.DocumentTypes,
        activity_name: activityName.updateDocumentTypes,
        activity_code: activityCode.updateDocumentTypes,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/document-types/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [
            {
                key: "title",
                value: "string",
                type: datatypes.String,
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "label",
                value: "string",
                type: datatypes.String,
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "color",
                value: "string",
                type: datatypes.String,
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "is_default",
                value: "boolean",
                type: datatypes.Boolean,
                required: false,
                parent: false,
                parent_key: "",
            },
        ],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },

    // delete document type
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.DocumentTypes,
        activity_name: activityName.deleteDocumentTypes,
        activity_code: activityCode.deleteDocumentTypes,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/document-types/:id",
        status: true,
        form_params: [],
        search_params: [
            {
                title: "force_action",
                value: "force_action",
                allowed_values: [],
                datatype: datatypes.Boolean,
                search_type: searchTypes.Exact,
                is_active: true,
                is_required: false,
            },
        ],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // activate document type
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.DocumentTypes,
        activity_name: activityName.activateDocumentTypes,
        activity_code: activityCode.activateDocumentTypes,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/document-types/:id/enable",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // deactivate document type
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.DocumentTypes,
        activity_name: activityName.deactivateDocumentTypes,
        activity_code: activityCode.deactivateDocumentTypes,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/document-types/:id/disable",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // show document type
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.DocumentTypes,
        activity_name: activityName.showDocumentTypes,
        activity_code: activityCode.showDocumentTypes,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/document-types/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },

    // log document type
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.DocumentTypes,
        activity_name: activityName.logDocumentTypes,
        activity_code: activityCode.logDocumentTypes,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/document-types/log",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
        access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
];

export default documentTypesApiData;
