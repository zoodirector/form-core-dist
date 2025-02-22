import { ValidationCause } from './types.cjs';
import { FormValidators } from './FormApi.cjs';
import { FieldValidators } from './FieldApi.cjs';
export type UpdaterFn<TInput, TOutput = TInput> = (input: TInput) => TOutput;
export type Updater<TInput, TOutput = TInput> = TOutput | UpdaterFn<TInput, TOutput>;
/**
 * @private
 */
export declare function functionalUpdate<TInput, TOutput = TInput>(updater: Updater<TInput, TOutput>, input: TInput): TOutput;
/**
 * Get a value from an object using a path, including dot notation.
 * @private
 */
export declare function getBy(obj: any, path: any): any;
/**
 * Set a value on an object using a path, including dot notation.
 * @private
 */
export declare function setBy(obj: any, _path: any, updater: Updater<any>): any;
/**
 * Delete a field on an object using a path, including dot notation.
 * @private
 */
export declare function deleteBy(obj: any, _path: any): any;
/**
 * @private
 */
export declare function makePathArray(str: string | Array<string | number>): (string | number)[];
/**
 * @private
 */
export declare function isNonEmptyArray(obj: any): boolean;
interface AsyncValidatorArrayPartialOptions<T> {
    validators?: T;
    asyncDebounceMs?: number;
}
/**
 * @private
 */
export interface AsyncValidator<T> {
    cause: ValidationCause;
    validate: T;
    debounceMs: number;
}
/**
 * @private
 */
export declare function getAsyncValidatorArray<T>(cause: ValidationCause, options: AsyncValidatorArrayPartialOptions<T>): T extends FieldValidators<any, any> ? Array<AsyncValidator<T['onChangeAsync'] | T['onBlurAsync'] | T['onSubmitAsync']>> : T extends FormValidators<any, any> ? Array<AsyncValidator<T['onChangeAsync'] | T['onBlurAsync'] | T['onSubmitAsync']>> : never;
interface SyncValidatorArrayPartialOptions<T> {
    validators?: T;
}
/**
 * @private
 */
export interface SyncValidator<T> {
    cause: ValidationCause;
    validate: T;
}
/**
 * @private
 */
export declare function getSyncValidatorArray<T>(cause: ValidationCause, options: SyncValidatorArrayPartialOptions<T>): T extends FieldValidators<any, any> ? Array<SyncValidator<T['onChange'] | T['onBlur'] | T['onSubmit']>> : T extends FormValidators<any, any> ? Array<SyncValidator<T['onChange'] | T['onBlur'] | T['onSubmit']>> : never;
export {};
