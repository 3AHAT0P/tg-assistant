import type { TupleIndices } from './@types/TupleIndices';

import { isNullOrUndefined } from './isNullOrUndefined';

const weekDayList = <const>['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const transformWeekDayIndexToName = (
  weekDay: TupleIndices<typeof weekDayList> | number,
): typeof weekDayList[typeof weekDay] => {
  const result = weekDayList[weekDay];
  if (isNullOrUndefined(result)) throw new Error('Invalid week day index!');
  return result;
};
