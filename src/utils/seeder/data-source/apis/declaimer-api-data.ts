import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/declaimer-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const declaimerApiData = (): IAPI[] => [
  // create declaimer
  {
    activity_type: activityTypes.Create,
    module: moduleTypes.Declaimers,
    activity_name: activityName.createDeclaimer,
    activity_code: activityCode.createDeclaimer,
    activity_method: apiMethods.POST,
    url: "/api/v1/masters/declaimers",
    status: true,
    form_params: [],
    search_params: [],

    access_params: {
    },

    control_params: [],
    payload_params: [
      {
        key: "key",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "title",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "content",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "language",
        value: "string",
        type: datatypes.String,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "country",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "metadata",
        value: "object",
        type: datatypes.Object,
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

  // list declaimer
  {
    activity_type: activityTypes.List,
    module: moduleTypes.Declaimers,
    activity_name: activityName.listDeclaimer,
    activity_code: activityCode.listDeclaimer,
    activity_method: apiMethods.GET,
    url: "/api/v1/masters/declaimers",
    status: true,
    form_params: [],
    search_params: [
      ...defaultSearchParams,
      {
        title: "key",
        value: "key",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Exact,
        is_active: true,
      },
      {
        title: "title_like",
        value: "title",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Partial,
        is_active: true,
      },
      {
        title: "language",
        value: "language",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Exact,
        is_active: true,
      },
      {
        title: "country",
        value: "country",
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

  // show declaimer
  {
    activity_type: activityTypes.Show,
    module: moduleTypes.Declaimers,
    activity_name: activityName.showDeclaimer,
    activity_code: activityCode.showDeclaimer,
    activity_method: apiMethods.GET,
    url: "/api/v1/masters/declaimers/:id",
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

  // update declaimer
  {
    activity_type: activityTypes.Update,
    module: moduleTypes.Declaimers,
    activity_name: activityName.updateDeclaimer,
    activity_code: activityCode.updateDeclaimer,
    activity_method: apiMethods.PUT,
    url: "/api/v1/masters/declaimers/:id",
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
        key: "content",
        value: "string",
        type: datatypes.String,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "metadata",
        value: "object",
        type: datatypes.Object,
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

  // delete declaimer
  {
    activity_type: activityTypes.Delete,
    module: moduleTypes.Declaimers,
    activity_name: activityName.deleteDeclaimer,
    activity_code: activityCode.deleteDeclaimer,
    activity_method: apiMethods.DELETE,
    url: "/api/v1/masters/declaimers/:id",
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

  // activate declaimer
  {
    activity_type: activityTypes.Activate,
    module: moduleTypes.Declaimers,
    activity_name: activityName.activateDeclaimer,
    activity_code: activityCode.activateDeclaimer,
    activity_method: apiMethods.PATCH,
    url: "/api/v1/masters/declaimers/:id/enable",
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

  // deactivate declaimer
  {
    activity_type: activityTypes.Deactivate,
    module: moduleTypes.Declaimers,
    activity_name: activityName.deactivateDeclaimer,
    activity_code: activityCode.deactivateDeclaimer,
    activity_method: apiMethods.PATCH,
    url: "/api/v1/masters/declaimers/:id/disable",
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

export default declaimerApiData;
