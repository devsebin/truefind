import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/provider-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const providerApiData: IAPI[] = [
    // create provider
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Providers,
        activity_name: activityName.createProvider,
        activity_code: activityCode.createProvider,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/providers",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
            admin_access: { type: AccessType.ALL, keys: [] },
        },

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
                key: "supportedCountries",
                value: "array",
                type: datatypes.Array,
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

    // list provider
    {
        activity_type: activityTypes.List,
        module: moduleTypes.Providers,
        activity_name: activityName.listProvider,
        activity_code: activityCode.listProvider,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/providers",
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

    // update provider
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.Providers,
        activity_name: activityName.updateProvider,
        activity_code: activityCode.updateProvider,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/providers/:id",
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
                key: "name",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "supportedCountries",
                value: "array",
                type: datatypes.Array,
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

    // delete provider
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Providers,
        activity_name: activityName.deleteProvider,
        activity_code: activityCode.deleteProvider,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/providers/:id",
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

    // activate provider
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.Providers,
        activity_name: activityName.activateProvider,
        activity_code: activityCode.activateProvider,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/providers/:id/enable",
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

    // deactivate provider
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.Providers,
        activity_name: activityName.deactivateProvider,
        activity_code: activityCode.deactivateProvider,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/providers/:id/disable",
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

    // show provider
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Providers,
        activity_name: activityName.showProvider,
        activity_code: activityCode.showProvider,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/providers/:id",
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

    // log provider
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.Providers,
        activity_name: activityName.logProvider,
        activity_code: activityCode.logProvider,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/providers/log",
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

export default providerApiData;
