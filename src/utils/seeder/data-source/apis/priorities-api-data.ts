import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/priorities-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const prioritiesApiData: IAPI[] = [
    // create priority
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Priorities,
        activity_name: activityName.createPriorities,
        activity_code: activityCode.createPriorities,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/priorities",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
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
        admin_access: true,
        user_access: false,
        employee_access: false,
        required_authentication: true,
    },

    // list priorities
    {
        activity_type: activityTypes.List,
        module: moduleTypes.Priorities,
        activity_name: activityName.listPriorities,
        activity_code: activityCode.listPriorities,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/priorities",
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
                admin_access: true,
                user_access: true,
                employee_access: true,
            },
            {
                title: "label",
                value: "label",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
                admin_access: true,
                user_access: true,
                employee_access: true,
            },
        ],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
            user_access: { type: AccessType.ALL, keys: [] },
            employee_access: { type: AccessType.ALL, keys: [] },
        },

        control_params: [],
        payload_params: [],
        admin_access: true,
        user_access: true,
        employee_access: true,
        required_authentication: true,
    },

    // update priority
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.Priorities,
        activity_name: activityName.updatePriorities,
        activity_code: activityCode.updatePriorities,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/priorities/:id",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
            user_access: { type: AccessType.ALL, keys: [] },
            employee_access: { type: AccessType.ALL, keys: [] },
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
        admin_access: true,
        user_access: true,
        employee_access: true,
        required_authentication: true,
    },

    // delete priority
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Priorities,
        activity_name: activityName.deletePriorities,
        activity_code: activityCode.deletePriorities,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/priorities/:id",
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
                admin_access: true,
                user_access: false,
                employee_access: false,
            },
        ],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
        },

        control_params: [],
        payload_params: [],
        admin_access: true,
        user_access: false,
        employee_access: false,
        required_authentication: true,
    },

    // activate priority
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.Priorities,
        activity_name: activityName.activatePriorities,
        activity_code: activityCode.activatePriorities,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/priorities/:id/enable",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
        },

        control_params: [],
        payload_params: [],
        admin_access: true,
        user_access: false,
        employee_access: false,
        required_authentication: true,
    },

    // deactivate priority
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.Priorities,
        activity_name: activityName.deactivatePriorities,
        activity_code: activityCode.deactivatePriorities,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/priorities/:id/disable",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
        },

        control_params: [],
        payload_params: [],
        admin_access: true,
        user_access: false,
        employee_access: false,
        required_authentication: true,
    },

    // show priority
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Priorities,
        activity_name: activityName.showPriorities,
        activity_code: activityCode.showPriorities,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/priorities/:id",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
            user_access: { type: AccessType.ALL, keys: [] },
            employee_access: { type: AccessType.ALL, keys: [] },
        },

        control_params: [],
        payload_params: [],
        admin_access: true,
        user_access: true,
        employee_access: true,
        required_authentication: true,
    },

    // log priority
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.Priorities,
        activity_name: activityName.logPriorities,
        activity_code: activityCode.logPriorities,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/priorities/log",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
        },

        control_params: [],
        payload_params: [],
        admin_access: true,
        user_access: false,
        employee_access: false,
        required_authentication: true,
    },
];

export default prioritiesApiData;
