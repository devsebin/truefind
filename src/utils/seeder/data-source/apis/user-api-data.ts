import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/user-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "@/utils/definitions/constants/search-types";

const userApiData = (): IAPI[] => [
  {
    activity_type: activityTypes.Create,
    module: moduleTypes.Users,
    activity_name: activityName.StoreBasicDetails,
    activity_code: activityCode.StoreBasicDetails,
    activity_method: apiMethods.POST,
    url: "/api/v1/users/basic",
    status: true,
    form_params: [],
    search_params: [],

    access_params: {
    },

    control_params: [],
    payload_params: [
      {
        key: "first_name",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "last_name",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "business_name",
        value: "string",
        type: datatypes.String,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "year_of_experience",
        value: "number",
        type: datatypes.Number,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "street_address",
        value: "string",
        type: datatypes.String,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "city",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "zip",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "ird_number",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "declaimer_id",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "is_gst_registered",
        value: "boolean",
        type: datatypes.Boolean,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "region_id",
        value: "64b8a1c8f1e67290bc5b4d1a",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "country_id",
        value: "64b8a1c8f1e67290bc5b4d1b",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "latitude",
        value: "-36.848461",
        type: datatypes.Number,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "longitude",
        value: "174.763336",
        type: datatypes.Number,
        required: true,
        parent: false,
        parent_key: "",
      },
    ],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("user"), getRoleId("employee")],
  },
  {
    activity_type: activityTypes.Create,
    module: moduleTypes.Users,
    activity_name: activityName.ListAvailableUserServices,
    activity_code: activityCode.ListAvailableUserServices,
    activity_method: apiMethods.GET,
    url: "/api/v1/users/:id/services",
    status: true,
    form_params: [],
    search_params: [
      {
        title: "is_full_region",
        value: "boolean",
        allowed_values: ["true", "false"],
        datatype: datatypes.Boolean,
        search_type: searchTypes.Exact,
        is_active: true,
      },
    ],
    access_params: {
    },
    control_params: [],
    payload_params: [
      {
        key: "latitude",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "longitude",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
    ],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
  },
  {
    activity_type: activityTypes.Show,
    module: moduleTypes.Users,
    activity_name: activityName.GetUserLocation,
    activity_code: activityCode.GetUserLocation,
    activity_method: apiMethods.GET,
    url: "/api/v1/users/:id/user-location",
    status: true,
    form_params: [],
    search_params: [],

    access_params: {
    },

    control_params: [],
    payload_params: [
      {
        key: "latitude",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "longitude",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
    ],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
  },
];

export default userApiData;
