import { conditionRegistry } from "@/core/enablement/registry/condition-registry";
import { hasActiveRegionCondition } from "./conditions/has-active-region.condition";
import { hasSmsProviderCondition } from "./conditions/has-sms-provider.condition";
import { hasConfigurationCondition } from "./conditions/has-configuration.condition";
import {
  hasTwilioProviderCondition,
  hasVonageProviderCondition,
} from "./conditions/has-named-provider.condition";

export function registerCountryConditions(): void {
  conditionRegistry.register(hasActiveRegionCondition);
  conditionRegistry.register(hasSmsProviderCondition);
  conditionRegistry.register(hasConfigurationCondition);
  conditionRegistry.register(hasTwilioProviderCondition);
  conditionRegistry.register(hasVonageProviderCondition);
}
