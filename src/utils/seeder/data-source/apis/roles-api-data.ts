import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/roles-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const rolesApiData = (): IAPI[] => [
    // create role
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Roles,
        activity_name: activityName.createRoles,
        activity_code: activityCode.createRoles,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/roles",
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
                key: "dimension",
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
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // list roles
    {
        activity_type: activityTypes.List,
        module: moduleTypes.Roles,
        activity_name: activityName.listRoles,
        activity_code: activityCode.listRoles,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/roles",
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
            },
            {
                title: "label",
                value: "label",
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
      access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("employee"), getRoleId("user")],
    },

    // update role
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.Roles,
        activity_name: activityName.updateRoles,
        activity_code: activityCode.updateRoles,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/roles/:id",
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
                key: "dimension",
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
      admin_access: true,
      user_access: true,
      employee_access: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("employee"), getRoleId("user")],
    },

    // delete role
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Roles,
        activity_name: activityName.deleteRoles,
        activity_code: activityCode.deleteRoles,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/roles/:id",
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
            },
        ],

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

    // activate role
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.Roles,
        activity_name: activityName.activateRoles,
        activity_code: activityCode.activateRoles,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/roles/:id/enable",
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

    // deactivate role
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.Roles,
        activity_name: activityName.deactivateRoles,
        activity_code: activityCode.deactivateRoles,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/roles/:id/disable",
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

    // show role
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Roles,
        activity_name: activityName.showRoles,
        activity_code: activityCode.showRoles,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/roles/:id",
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
      access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("employee"), getRoleId("user")],
    },

    // log role
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.Roles,
        activity_name: activityName.logRoles,
        activity_code: activityCode.logRoles,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/roles/log",
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

export default rolesApiData;
