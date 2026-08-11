import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/user-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";

const userApiData: IAPI[] = [
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
      admin_access: { type: AccessType.ALL, keys: [] },
      user_access: { type: AccessType.ALL, keys: [] },
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
        key: "gst_number",
        value: "string",
        type: datatypes.String,
        required: false,
        parent: false,
        parent_key: "",
      },
    ],
    admin_access: true,
    user_access: true,
    employee_access: false,
    required_authentication: true,
  },
];

export default userApiData;
