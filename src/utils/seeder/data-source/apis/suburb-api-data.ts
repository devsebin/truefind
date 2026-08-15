import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/suburb-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const suburbsApiData = (): IAPI[] => [
    // create suburb
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Suburbs,
        activity_name: activityName.createSuburb,
        activity_code: activityCode.createSuburb,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/suburbs",
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
            {
                key: "district_id",
                value: "string",
                type: datatypes.Object,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "post_code",
                value: "string",
                type: datatypes.String,
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "latitude",
                value: "number",
                type: datatypes.Number,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "longitude",
                value: "number",
                type: datatypes.Number,
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

    // list suburb
    {
        activity_type: activityTypes.List,
        module: moduleTypes.Suburbs,
        activity_name: activityName.listSuburb,
        activity_code: activityCode.listSuburb,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/suburbs",
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
                title: "code_like",
                value: "code",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
            },
            {
                title: "country_id",
                value: "country_id._id",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
            },
            {
                title: "region_id",
                value: "region_id._id",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
            },
            {
                title: "district_id",
                value: "district_id._id",
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

    // update suburb
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.Suburbs,
        activity_name: activityName.updateSuburb,
        activity_code: activityCode.updateSuburb,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/suburbs/:id",
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
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "code",
                value: "string",
                type: datatypes.String,
                required: false,
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
            {
                key: "district_id",
                value: "string",
                type: datatypes.String,
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "post_code",
                value: "string",
                type: datatypes.String,
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "latitude",
                value: "number",
                type: datatypes.Number,
                required: false,
                parent: false,
                parent_key: "",
            },
            {
                key: "longitude",
                value: "number",
                type: datatypes.Number,
                required: false,
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

    // delete suburb
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Suburbs,
        activity_name: activityName.deleteSuburb,
        activity_code: activityCode.deleteSuburb,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/suburbs/:id",
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
    // activate suburb
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.Suburbs,
        activity_name: activityName.activateSuburb,
        activity_code: activityCode.activateSuburb,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/suburbs/:id/enable",
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
    // deactivate suburb
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.Suburbs,
        activity_name: activityName.deactivateSuburb,
        activity_code: activityCode.deactivateSuburb,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/suburbs/:id/disable",
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
    // show suburb
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Suburbs,
        activity_name: activityName.showSuburb,
        activity_code: activityCode.showSuburb,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/suburbs/:id",
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
    // log suburb
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.Suburbs,
        activity_name: activityName.logSuburb,
        activity_code: activityCode.logSuburb,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/suburbs/log",
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

export default suburbsApiData;
