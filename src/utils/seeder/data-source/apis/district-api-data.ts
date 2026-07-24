import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/district-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const districtsApiData: IAPI[] = [
    // create district
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Districts,
        activity_name: activityName.createDistrict,
        activity_code: activityCode.createDistrict,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/districts",
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
                key: "code",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "country_id",
                value: "string",
                type: datatypes.Object,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "region_id",
                value: "string",
                type: datatypes.Object,
                required: true,
                parent: false,
                parent_key: "",
            },
        ],
        admin_access: true,
        user_access: false,
        employee_access: false,
        required_authentication: true,
    },

    // list district
    {
        activity_type: activityTypes.List,
        module: moduleTypes.Districts,
        activity_name: activityName.listDistrict,
        activity_code: activityCode.listDistrict,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/districts",
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
            {
                title: "code_like",
                value: "code",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
                admin_access: true,
                user_access: true,
                employee_access: true,
            },
            {
                title: "country_id",
                value: "country_id._id",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
                admin_access: true,
                user_access: true,
                employee_access: true,
            },
            {
                title: "region_id",
                value: "region_id._id",
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

    // update district
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.Districts,
        activity_name: activityName.updateDistrict,
        activity_code: activityCode.updateDistrict,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/districts/:id",
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
                key: "code",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "country_id",
                value: "string",
                type: datatypes.String,
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "region_id",
                value: "string",
                type: datatypes.String,
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

    // delete district
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Districts,
        activity_name: activityName.deleteDistrict,
        activity_code: activityCode.deleteDistrict,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/districts/:id",
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
    // activate district
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.Districts,
        activity_name: activityName.activateDistrict,
        activity_code: activityCode.activateDistrict,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/districts/:id/enable",
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
    // deactivate district
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.Districts,
        activity_name: activityName.deactivateDistrict,
        activity_code: activityCode.deactivateDistrict,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/districts/:id/disable",
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
    // show district
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Districts,
        activity_name: activityName.showDistrict,
        activity_code: activityCode.showDistrict,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/districts/:id",
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
    // log district
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.Districts,
        activity_name: activityName.logDistrict,
        activity_code: activityCode.logDistrict,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/districts/log",
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

export default districtsApiData;
