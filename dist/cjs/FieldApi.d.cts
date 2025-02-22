import { Store } from '@tanstack/store';
import { FieldInfo, FieldsErrorMapFromValidator, FormApi } from './FormApi.cjs';
import { UpdateMetaOptions, ValidationCause, ValidationError, ValidationErrorMap, ValidationSource, Validator } from './types.cjs';
import { Updater } from './utils.cjs';
import { DeepKeys, DeepValue, NoInfer } from './util-types.cjs';
/**
 * @private
 */
export type FieldValidateFn<TParentData, TName extends DeepKeys<TParentData>, TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined, TFormValidator extends Validator<TParentData, unknown> | undefined = undefined, TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>> = (props: {
    value: TData;
    fieldApi: FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>;
}) => ValidationError;
/**
 * @private
 */
export type FieldValidateOrFn<TParentData, TName extends DeepKeys<TParentData>, TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined, TFormValidator extends Validator<TParentData, unknown> | undefined = undefined, TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>> = TFieldValidator extends Validator<TData, infer TFN> ? TFN | FieldValidateFn<TParentData, TName, TFieldValidator, TFormValidator, TData> : TFormValidator extends Validator<TParentData, infer FFN> ? FFN | FieldValidateFn<TParentData, TName, TFieldValidator, TFormValidator, TData> : FieldValidateFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
/**
 * @private
 */
export type FieldValidateAsyncFn<TParentData, TName extends DeepKeys<TParentData>, TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined, TFormValidator extends Validator<TParentData, unknown> | undefined = undefined, TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>> = (options: {
    value: TData;
    fieldApi: FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    signal: AbortSignal;
}) => ValidationError | Promise<ValidationError>;
/**
 * @private
 */
export type FieldAsyncValidateOrFn<TParentData, TName extends DeepKeys<TParentData>, TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined, TFormValidator extends Validator<TParentData, unknown> | undefined = undefined, TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>> = TFieldValidator extends Validator<TData, infer TFN> ? TFN | FieldValidateAsyncFn<TParentData, TName, TFieldValidator, TFormValidator, TData> : TFormValidator extends Validator<TParentData, infer FFN> ? FFN | FieldValidateAsyncFn<TParentData, TName, TFieldValidator, TFormValidator, TData> : FieldValidateAsyncFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
export interface FieldValidators<TParentData, TName extends DeepKeys<TParentData>, TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined, TFormValidator extends Validator<TParentData, unknown> | undefined = undefined, TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>> {
    /**
     * An optional function that takes a param of `formApi` which is a generic type of `TData` and `TParentData`
     */
    onMount?: FieldValidateOrFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    /**
     * An optional property that takes a `ValidateFn` which is a generic of `TData` and `TParentData`.
     * If `validatorAdapter` is passed, this may also accept a property from the respective adapter
     *
     * @example z.string().min(1) // if `zodAdapter` is passed
     */
    onChange?: FieldValidateOrFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    /**
     * An optional property similar to `onChange` but async validation. If `validatorAdapter`
     * is passed, this may also accept a property from the respective adapter
     *
     * @example z.string().refine(async (val) => val.length > 3, { message: 'Testing 123' }) // if `zodAdapter` is passed
     */
    onChangeAsync?: FieldAsyncValidateOrFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    /**
     * An optional number to represent how long the `onChangeAsync` should wait before running
     *
     * If set to a number larger than 0, will debounce the async validation event by this length of time in milliseconds
     */
    onChangeAsyncDebounceMs?: number;
    /**
     * An optional list of field names that should trigger this field's `onChange` and `onChangeAsync` events when its value changes
     */
    onChangeListenTo?: DeepKeys<TParentData>[];
    /**
     * An optional function, that runs on the blur event of input.
     * If `validatorAdapter` is passed, this may also accept a property from the respective adapter
     *
     * @example z.string().min(1) // if `zodAdapter` is passed
     */
    onBlur?: FieldValidateOrFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    /**
     * An optional property similar to `onBlur` but async validation. If `validatorAdapter`
     * is passed, this may also accept a property from the respective adapter
     *
     * @example z.string().refine(async (val) => val.length > 3, { message: 'Testing 123' }) // if `zodAdapter` is passed
     */
    onBlurAsync?: FieldAsyncValidateOrFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    /**
     * An optional number to represent how long the `onBlurAsync` should wait before running
     *
     * If set to a number larger than 0, will debounce the async validation event by this length of time in milliseconds
     */
    onBlurAsyncDebounceMs?: number;
    /**
     * An optional list of field names that should trigger this field's `onBlur` and `onBlurAsync` events when its value changes
     */
    onBlurListenTo?: DeepKeys<TParentData>[];
    /**
     * An optional function, that runs on the submit event of form.
     * If `validatorAdapter` is passed, this may also accept a property from the respective adapter
     *
     * @example z.string().min(1) // if `zodAdapter` is passed
     */
    onSubmit?: FieldValidateOrFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    /**
     * An optional property similar to `onSubmit` but async validation. If `validatorAdapter`
     * is passed, this may also accept a property from the respective adapter
     *
     * @example z.string().refine(async (val) => val.length > 3, { message: 'Testing 123' }) // if `zodAdapter` is passed
     */
    onSubmitAsync?: FieldAsyncValidateOrFn<TParentData, TName, TFieldValidator, TFormValidator, TData>;
}
/**
 * An object type representing the options for a field in a form.
 */
export interface FieldOptions<TParentData, TName extends DeepKeys<TParentData>, TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined, TFormValidator extends Validator<TParentData, unknown> | undefined = undefined, TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>> {
    /**
     * The field name. The type will be `DeepKeys<TParentData>` to ensure your name is a deep key of the parent dataset.
     */
    name: TName;
    /**
     * An optional default value for the field.
     */
    defaultValue?: NoInfer<TData>;
    /**
     * The default time to debounce async validation if there is not a more specific debounce time passed.
     */
    asyncDebounceMs?: number;
    /**
     * If `true`, always run async validation, even if there are errors emitted during synchronous validation.
     */
    asyncAlways?: boolean;
    /**
     * A validator provided by an extension, like `yupValidator` from `@tanstack/yup-form-adapter`
     */
    validatorAdapter?: TFieldValidator;
    /**
     * A list of validators to pass to the field
     */
    validators?: FieldValidators<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    /**
     * An optional object with default metadata for the field.
     */
    defaultMeta?: Partial<FieldMeta>;
}
/**
 * An object type representing the required options for the FieldApi class.
 */
export interface FieldApiOptions<TParentData, TName extends DeepKeys<TParentData>, TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined, TFormValidator extends Validator<TParentData, unknown> | undefined = undefined, TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>> extends FieldOptions<TParentData, TName, TFieldValidator, TFormValidator, TData> {
    form: FormApi<TParentData, TFormValidator>;
}
/**
 * An object type representing the metadata of a field in a form.
 */
export type FieldMeta = {
    /**
     * A flag indicating whether the field has been touched.
     */
    isTouched: boolean;
    /**
     * A flag indicating whether the field has been blurred.
     */
    isBlurred: boolean;
    /**
     * A flag that is `true` if the field's value has not been modified by the user. Opposite of `isDirty`.
     */
    isPristine: boolean;
    /**
     * A flag that is `true` if the field's value has been modified by the user. Opposite of `isPristine`.
     */
    isDirty: boolean;
    /**
     * An array of errors related to the field value.
     */
    errors: ValidationError[];
    /**
     * A map of errors related to the field value.
     */
    errorMap: ValidationErrorMap;
    /**
     * A flag indicating whether the field is currently being validated.
     */
    isValidating: boolean;
};
/**
 * An object type representing the state of a field.
 */
export type FieldState<TData> = {
    /**
     * The current value of the field.
     */
    value: TData;
    /**
     * The current metadata of the field.
     */
    meta: FieldMeta;
};
/**
 * A class representing the API for managing a form field.
 *
 * Normally, you will not need to create a new `FieldApi` instance directly.
 * Instead, you will use a framework hook/function like `useField` or `createField`
 * to create a new instance for you that uses your framework's reactivity model.
 * However, if you need to create a new instance manually, you can do so by calling
 * the `new FieldApi` constructor.
 */
export declare class FieldApi<TParentData, TName extends DeepKeys<TParentData>, TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined, TFormValidator extends Validator<TParentData, unknown> | undefined = undefined, TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>> {
    /**
     * A reference to the form API instance.
     */
    form: FieldApiOptions<TParentData, TName, TFieldValidator, TFormValidator, TData>['form'];
    /**
     * The field name.
     */
    name: DeepKeys<TParentData>;
    /**
     * The field options.
     */
    options: FieldApiOptions<TParentData, TName, TFieldValidator, TFormValidator, TData>;
    /**
     * The field state store.
     */
    store: Store<FieldState<TData>>;
    /**
     * The current field state.
     */
    state: FieldState<TData>;
    /**
     * @private
     */
    prevState: FieldState<TData>;
    /**
     * Initializes a new `FieldApi` instance.
     */
    constructor(opts: FieldApiOptions<TParentData, TName, TFieldValidator, TFormValidator, TData>);
    /**
     * @private
     */
    runValidator<TValue extends {
        value: TData;
        fieldApi: FieldApi<any, any, any, any>;
        validationSource: ValidationSource;
    }, TType extends 'validate' | 'validateAsync'>(props: {
        validate: TType extends 'validate' ? FieldValidateOrFn<any, any, any, any> : FieldAsyncValidateOrFn<any, any, any, any>;
        value: TValue;
        type: TType;
    }): TType extends 'validate' ? ValidationError : Promise<ValidationError>;
    /**
     * Mounts the field instance to the form.
     */
    mount: () => () => void;
    /**
     * Updates the field instance with new options.
     */
    update: (opts: FieldApiOptions<TParentData, TName, TFieldValidator, TFormValidator, TData>) => void;
    /**
     * Gets the current field value.
     * @deprecated Use `field.state.value` instead.
     */
    getValue: () => TData;
    /**
     * Sets the field value and run the `change` validator.
     */
    setValue: (updater: Updater<TData>, options?: UpdateMetaOptions) => void;
    /**
     * @private
     */
    _getMeta: () => FieldMeta | undefined;
    /**
     * Gets the current field metadata.
     */
    getMeta: () => FieldMeta;
    /**
     * Sets the field metadata.
     */
    setMeta: (updater: Updater<FieldMeta>) => void;
    /**
     * Gets the field information object.
     */
    getInfo: () => FieldInfo<TParentData, TFormValidator>;
    /**
     * Pushes a new value to the field.
     */
    pushValue: (value: TData extends any[] ? TData[number] : never, opts?: UpdateMetaOptions) => void;
    /**
     * Inserts a value at the specified index, shifting the subsequent values to the right.
     */
    insertValue: (index: number, value: TData extends any[] ? TData[number] : never, opts?: UpdateMetaOptions) => Promise<void>;
    /**
     * Replaces a value at the specified index.
     */
    replaceValue: (index: number, value: TData extends any[] ? TData[number] : never, opts?: UpdateMetaOptions) => Promise<void>;
    /**
     * Removes a value at the specified index.
     */
    removeValue: (index: number, opts?: UpdateMetaOptions) => Promise<void>;
    /**
     * Swaps the values at the specified indices.
     */
    swapValues: (aIndex: number, bIndex: number, opts?: UpdateMetaOptions) => void;
    /**
     * Moves the value at the first specified index to the second specified index.
     */
    moveValue: (aIndex: number, bIndex: number, opts?: UpdateMetaOptions) => void;
    /**
     * @private
     */
    getLinkedFields: (cause: ValidationCause) => FieldApi<any, any, any, any, any>[];
    /**
     * @private
     */
    validateSync: (cause: ValidationCause, errorFromForm: ValidationErrorMap) => {
        hasErrored: boolean;
    };
    /**
     * @private
     */
    validateAsync: (cause: ValidationCause, formValidationResultPromise: Promise<FieldsErrorMapFromValidator<TParentData>>) => Promise<ValidationError[]>;
    /**
     * Validates the field value.
     */
    validate: (cause: ValidationCause) => ValidationError[] | Promise<ValidationError[]>;
    /**
     * Handles the change event.
     */
    handleChange: (updater: Updater<TData>) => void;
    /**
     * Handles the blur event.
     */
    handleBlur: () => void;
    /**
     * Updates the field's errorMap
     */
    setErrorMap(errorMap: ValidationErrorMap): void;
}
