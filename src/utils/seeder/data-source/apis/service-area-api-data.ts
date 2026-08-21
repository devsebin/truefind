import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/service-area-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";

const serviceAreaApiData = (): IAPI[] => [
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.ServiceAreaConfigurations,
        activity_name: activityName.createServiceArea,
        activity_code: activityCode.createServiceArea,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/service-area-configurations/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },
        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.ServiceAreaConfigurations,
        activity_name: activityName.showEffectiveServiceArea,
        activity_code: activityCode.showEffectiveServiceArea,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/service-area-configurations/:id/effective",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },
        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    {
        activity_type: activityTypes.List,
        module: moduleTypes.ServiceAreaConfigurations,
        activity_name: activityName.listAvailableServiceArea,
        activity_code: activityCode.listAvailableServiceArea,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/service-area-configurations/available",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },
        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.ServiceAreaConfigurations,
        activity_name: activityName.updateServiceArea,
        activity_code: activityCode.updateServiceArea,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/service-area-configurations/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },
        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.ServiceAreaConfigurations,
        activity_name: activityName.enableServiceArea,
        activity_code: activityCode.enableServiceArea,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/service-area-configurations/:id/enable",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },
        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.ServiceAreaConfigurations,
        activity_name: activityName.disableServiceArea,
        activity_code: activityCode.disableServiceArea,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/service-area-configurations/:id/disable",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },
        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
];

export default serviceAreaApiData;
