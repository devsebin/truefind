import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/country-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const countriesApiData = (): IAPI[] => [
    // create country
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Countries,
        activity_name: activityName.createCountry,
        activity_code: activityCode.createCountry,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/countries",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
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
                key: "iso_code",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "iso_code_3",
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
                key: "phone_code",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "currency",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "continent",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "timezone",
                value: "array",
                type: datatypes.Array,
                required: true,
                parent: false,
                parent_key: "",
            },
        ],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // list country
    {
        activity_type: activityTypes.List,
        module: moduleTypes.Countries,
        activity_name: activityName.listCountry,
        activity_code: activityCode.listCountry,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/countries",
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
            },
            {
                title: "iso_code",
                value: "iso_code",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
            },
            {
                title: "iso_code_3",
                value: "iso_code_3",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
            },
        ],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: true,
      employee_access: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },

    // update country
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.Countries,
        activity_name: activityName.updateCountry,
        activity_code: activityCode.updateCountry,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/countries/:id",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
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
                key: "iso_code",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "iso_code_3",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "phone_code",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "currency",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "continent",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "timezone",
                value: "array",
                type: datatypes.Array,
                required: true,
                parent: false,
                parent_key: "",
            },
        ],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // delete country
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Countries,
        activity_name: activityName.deleteCountry,
        activity_code: activityCode.deleteCountry,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/countries/:id",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    // activate country
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.Countries,
        activity_name: activityName.activateCountry,
        activity_code: activityCode.activateCountry,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/countries/:id/enable",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    // deactivate country
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.Countries,
        activity_name: activityName.deactivateCountry,
        activity_code: activityCode.deactivateCountry,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/countries/:id/disable",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    // show country
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Countries,
        activity_name: activityName.showCountry,
        activity_code: activityCode.showCountry,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/countries/:id",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: true,
      employee_access: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },
    // log country
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.Countries,
        activity_name: activityName.logCountry,
        activity_code: activityCode.logCountry,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/countries/log",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
];

export default countriesApiData;
