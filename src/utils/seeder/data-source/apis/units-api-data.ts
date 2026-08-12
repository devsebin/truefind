import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/units-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const unitsApiData: IAPI[] = [
    // create unit
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Units,
        activity_name: activityName.createUnits,
        activity_code: activityCode.createUnits,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/units",
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

    // list units
    {
        activity_type: activityTypes.List,
        module: moduleTypes.Units,
        activity_name: activityName.listUnits,
        activity_code: activityCode.listUnits,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/units",
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

    // update unit
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.Units,
        activity_name: activityName.updateUnits,
        activity_code: activityCode.updateUnits,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/units/:id",
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

    // delete unit
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Units,
        activity_name: activityName.deleteUnits,
        activity_code: activityCode.deleteUnits,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/units/:id",
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

    // activate unit
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.Units,
        activity_name: activityName.activateUnits,
        activity_code: activityCode.activateUnits,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/units/:id/enable",
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

    // deactivate unit
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.Units,
        activity_name: activityName.deactivateUnits,
        activity_code: activityCode.deactivateUnits,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/units/:id/disable",
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

    // show unit
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Units,
        activity_name: activityName.showUnits,
        activity_code: activityCode.showUnits,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/units/:id",
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

    // log unit
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.Units,
        activity_name: activityName.logUnits,
        activity_code: activityCode.logUnits,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/units/log",
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

export default unitsApiData;
