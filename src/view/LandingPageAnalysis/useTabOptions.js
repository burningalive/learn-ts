import { useMemo } from 'react';
import {
  // transformFromGroup,
  transformFromOneLevel,
  transformFromTwoLevel,
} from '$utils/mapObjTranform';

export function useTabOptions(mapObj) {
  const industryOptions = useMemo(() => {
    return transformFromOneLevel(mapObj.noAppCat);
  }, [mapObj]);

  const platformOptions = useMemo(() => {
    return transformFromTwoLevel(mapObj.serviceChannel);
  }, [mapObj]);

  const osOptions = useMemo(() => {
    return transformFromOneLevel(mapObj.os);
  }, [mapObj]);

  return {
    industryOptions,
    platformOptions,
    osOptions,
  };
}
