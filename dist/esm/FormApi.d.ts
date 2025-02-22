import { Store } from '@tanstack/store';
import { Updater } from './utils.js';
import { DeepKeys, DeepValue } from './util-types.js';
import { FieldApi, FieldMeta } from './FieldApi.js';
import { FormValidationError, FormValidationErrorMap, UpdateMetaOptions, ValidationCause, ValidationError, ValidationErrorMap, ValidationErrorMapKeys, ValidationSource, Validator } from './types.js';
export type FieldsErrorMapFromValidator<TFormData> = Partial<Record<DeepKeys<TFormData>, ValidationErrorMap>>;
export type FormValidateFn<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> = (props: {
    value: TFormData;
    formApi: FormApi<TFormData, TFormValidator>;
}) => FormValidationError<TFormData>;
/**
 * @private
 */
export type FormValidateOrFn<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> = TFormValidator extends Validator<TFormData, infer TFN> ? TFN : FormValidateFn<TFormData, TFormValidator>;
/**
 * @private
 */
export type FormValidateAsyncFn<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> = (props: {
    value: TFormData;
    formApi: FormApi<TFormData, TFormValidator>;
    signal: AbortSignal;
}) => FormValidationError<TFormData> | Promise<FormValidationError<TFormData>>;
export type FormValidator<TFormData, TType, TFn = unknown> = {
    validate(options: {
        value: TType;
    }, fn: TFn): ValidationError;
    validateAsync(options: {
        value: TType;
    }, fn: TFn): Promise<FormValidationError<TFormData>>;
};
/**
 * @private
 */
export type FormAsyncValidateOrFn<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> = TFormValidator extends Validator<TFormData, infer FFN> ? FFN | FormValidateAsyncFn<TFormData, TFormValidator> : FormValidateAsyncFn<TFormData, TFormValidator>;
export interface FormValidators<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> {
    /**
     * Optional function that fires as soon as the component mounts.
     */
    onMount?: FormValidateOrFn<TFormData, TFormValidator>;
    /**
     * Optional function that checks the validity of your data whenever a value changes
     */
    onChange?: FormValidateOrFn<TFormData, TFormValidator>;
    /**
     * Optional onChange asynchronous counterpart to onChange. Useful for more complex validation logic that might involve server requests.
     */
    onChangeAsync?: FormAsyncValidateOrFn<TFormData, TFormValidator>;
    /**
     * The default time in milliseconds that if set to a number larger than 0, will debounce the async validation event by this length of time in milliseconds.
     */
    onChangeAsyncDebounceMs?: number;
    /**
     * Optional function that validates the form data when a field loses focus, returns a `FormValidationError`
     */
    onBlur?: FormValidateOrFn<TFormData, TFormValidator>;
    /**
     * Optional onBlur asynchronous validation method for when a field loses focus returns a ` FormValidationError` or a promise of `Promise<FormValidationError>`
     */
    onBlurAsync?: FormAsyncValidateOrFn<TFormData, TFormValidator>;
    /**
     * The default time in milliseconds that if set to a number larger than 0, will debounce the async validation event by this length of time in milliseconds.
     */
    onBlurAsyncDebounceMs?: number;
    onSubmit?: FormValidateOrFn<TFormData, TFormValidator>;
    onSubmitAsync?: FormAsyncValidateOrFn<TFormData, TFormValidator>;
}
/**
 * @private
 */
export interface FormTransform<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> {
    fn: (formBase: FormApi<TFormData, TFormValidator>) => FormApi<TFormData, TFormValidator>;
    deps: unknown[];
}
/**
 * An object representing the options for a form.
 */
export interface FormOptions<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> {
    /**
     * Set initial values for your form.
     */
    defaultValues?: TFormData;
    /**
     * The default state for the form.
     */
    defaultState?: Partial<FormState<TFormData>>;
    /**
     * If true, always run async validation, even when sync validation has produced an error. Defaults to undefined.
     */
    asyncAlways?: boolean;
    /**
     * Optional time in milliseconds if you want to introduce a delay before firing off an async action.
     */
    asyncDebounceMs?: number;
    /**
     * A validator adapter to support usage of extra validation types (IE: Zod, Yup, or Valibot usage)
     */
    validatorAdapter?: TFormValidator;
    /**
     * A list of validators to pass to the form
     */
    validators?: FormValidators<TFormData, TFormValidator>;
    /**
     * A function to be called when the form is submitted, what should happen once the user submits a valid form returns `any` or a promise `Promise<any>`
     */
    onSubmit?: (props: {
        value: TFormData;
        formApi: FormApi<TFormData, TFormValidator>;
    }) => any | Promise<any>;
    /**
     * Specify an action for scenarios where the user tries to submit an invalid form.
     */
    onSubmitInvalid?: (props: {
        value: TFormData;
        formApi: FormApi<TFormData, TFormValidator>;
    }) => void;
    transform?: FormTransform<TFormData, TFormValidator>;
}
/**
 * An object representing the validation metadata for a field. Not intended for public usage.
 */
export type ValidationMeta = {
    /**
     * An abort controller stored in memory to cancel previous async validation attempts.
     */
    lastAbortController: AbortController;
};
/**
 * An object representing the field information for a specific field within the form.
 */
export type FieldInfo<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> = {
    /**
     * An instance of the FieldAPI.
     */
    instance: FieldApi<TFormData, any, Validator<unknown, unknown> | undefined, TFormValidator> | null;
    /**
     * A record of field validation internal handling.
     */
    validationMetaMap: Record<ValidationErrorMapKeys, ValidationMeta | undefined>;
};
/**
 * An object representing the current state of the form.
 */
export type FormState<TFormData> = {
    /**
     * The current values of the form fields.
     */
    values: TFormData;
    /**
     * A boolean indicating if the form is currently validating.
     */
    isFormValidating: boolean;
    /**
     * A boolean indicating if the form is valid.
     */
    isFormValid: boolean;
    /**
     * The error array for the form itself.
     */
    errors: ValidationError[];
    /**
     * The error map for the form itself.
     */
    errorMap: FormValidationErrorMap;
    /**
     * An internal mechanism used for keeping track of validation logic in a form.
     */
    validationMetaMap: Record<ValidationErrorMapKeys, ValidationMeta | undefined>;
    /**
     * A record of field metadata for each field in the form.
     */
    fieldMeta: Record<DeepKeys<TFormData>, FieldMeta>;
    /**
     * A boolean indicating if any of the form fields are currently validating.
     */
    isFieldsValidating: boolean;
    /**
     * A boolean indicating if all the form fields are valid.
     */
    isFieldsValid: boolean;
    /**
     * A boolean indicating if the form is currently submitting.
     */
    isSubmitting: boolean;
    /**
     * A boolean indicating if any of the form fields have been touched.
     */
    isTouched: boolean;
    /**
     * A boolean indicating if any of the form fields have been blurred.
     */
    isBlurred: boolean;
    /**
     * A boolean indicating if any of the form's fields' values have been modified by the user. `True` if the user have modified at least one of the fields. Opposite of `isPristine`.
     */
    isDirty: boolean;
    /**
     * A boolean indicating if none of the form's fields' values have been modified by the user. `True` if the user have not modified any of the fields. Opposite of `isDirty`.
     */
    isPristine: boolean;
    /**
     * A boolean indicating if the form has been submitted.
     */
    isSubmitted: boolean;
    /**
     * A boolean indicating if the form or any of its fields are currently validating.
     */
    isValidating: boolean;
    /**
     * A boolean indicating if the form and all its fields are valid.
     */
    isValid: boolean;
    /**
     * A boolean indicating if the form can be submitted based on its current state.
     */
    canSubmit: boolean;
    /**
     * A counter for tracking the number of submission attempts.
     */
    submissionAttempts: number;
};
/**
 * A class representing the Form API. It handles the logic and interactions with the form state.
 *
 * Normally, you will not need to create a new `FormApi` instance directly. Instead, you will use a framework
 * hook/function like `useForm` or `createForm` to create a new instance for you that uses your framework's reactivity model.
 * However, if you need to create a new instance manually, you can do so by calling the `new FormApi` constructor.
 */
export declare class FormApi<TFormData, TFormValidator extends Validator<TFormData, unknown> | undefined = undefined> {
    /**
     * The options for the form.
     */
    options: FormOptions<TFormData, TFormValidator>;
    /**
     * A [TanStack Store instance](https://tanstack.com/store/latest/docs/reference/Store) that keeps track of the form's state.
     */
    store: Store<FormState<TFormData>>;
    /**
     * The current state of the form.
     *
     * **Note:**
     * Do not use `state` directly, as it is not reactive.
     * Please use form.useStore() utility to subscribe to state
     */
    state: FormState<TFormData>;
    /**
     * A record of field information for each field in the form.
     */
    fieldInfo: Record<DeepKeys<TFormData>, FieldInfo<TFormData, TFormValidator>>;
    /**
     * @private
     */
    prevTransformArray: unknown[];
    /**
     * Constructs a new `FormApi` instance with the given form options.
     */
    constructor(opts?: FormOptions<TFormData, TFormValidator>);
    /**
     * @private
     */
    runValidator<TValue extends {
        value: TFormData;
        formApi: FormApi<any, any>;
        validationSource: ValidationSource;
    }, TType extends 'validate' | 'validateAsync'>(props: {
        validate: TType extends 'validate' ? FormValidateOrFn<TFormData, TFormValidator> : FormAsyncValidateOrFn<TFormData, TFormValidator>;
        value: TValue;
        type: TType;
    }): ReturnType<ReturnType<Validator<any>>[TType]>;
    mount: () => void;
    /**
     * Updates the form options and form state.
     */
    update: (options?: FormOptions<TFormData, TFormValidator>) => void;
    /**
     * Resets the form state to the default values.
     */
    reset: () => void;
    /**
     * Validates all fields in the form using the correct handlers for a given validation type.
     */
    validateAllFields: (cause: ValidationCause) => Promise<ValidationError[]>;
    /**
     * Validates the children of a specified array in the form starting from a given index until the end using the correct handlers for a given validation type.
     */
    validateArrayFieldsStartingFrom: <TField extends DeepKeys<TFormData>>(field: TField, index: number, cause: ValidationCause) => Promise<ValidationError[]>;
    /**
     * Validates a specified field in the form using the correct handlers for a given validation type.
     */
    validateField: <TField extends DeepKeys<TFormData>>(field: TField, cause: ValidationCause) => ValidationError[] | Promise<ValidationError[]>;
    /**
     * TODO: This code is copied from FieldApi, we should refactor to share
     * @private
     */
    validateSync: (cause: ValidationCause) => {
        hasErrored: boolean;
        fieldsErrorMap: FieldsErrorMapFromValidator<TFormData>;
    };
    /**
     * @private
     */
    validateAsync: (cause: ValidationCause) => Promise<FieldsErrorMapFromValidator<TFormData>>;
    /**
     * @private
     */
    validate: (cause: ValidationCause) => FieldsErrorMapFromValidator<TFormData> | Promise<FieldsErrorMapFromValidator<TFormData>>;
    /**
     * Handles the form submission, performs validation, and calls the appropriate onSubmit or onInvalidSubmit callbacks.
     */
    handleSubmit: () => Promise<any>;
    /**
     * Gets the value of the specified field.
     */
    getFieldValue: <TField extends DeepKeys<TFormData>>(field: TField) => DeepValue<TFormData, TField>;
    /**
     * Gets the metadata of the specified field.
     */
    getFieldMeta: <TField extends DeepKeys<TFormData>>(field: TField) => FieldMeta | undefined;
    /**
     * Gets the field info of the specified field.
     */
    getFieldInfo: <TField extends DeepKeys<TFormData>>(field: TField) => FieldInfo<TFormData, TFormValidator>;
    /**
     * Updates the metadata of the specified field.
     */
    setFieldMeta: <TField extends DeepKeys<TFormData>>(field: TField, updater: Updater<FieldMeta>) => void;
    resetFieldMeta: <TField extends DeepKeys<TFormData>>(fieldMeta: Record<TField, FieldMeta>) => Record<TField, FieldMeta>;
    /**
     * Sets the value of the specified field and optionally updates the touched state.
     */
    setFieldValue: <TField extends DeepKeys<TFormData>>(field: TField, updater: Updater<DeepValue<TFormData, TField>>, opts?: UpdateMetaOptions) => void;
    deleteField: <TField extends DeepKeys<TFormData>>(field: TField) => void;
    /**
     * Pushes a value into an array field.
     */
    pushFieldValue: <TField extends DeepKeys<TFormData>>(field: TField, value: DeepValue<TFormData, TField> extends any[] ? DeepValue<TFormData, TField>[number] : never, opts?: UpdateMetaOptions) => void;
    /**
     * Inserts a value into an array field at the specified index, shifting the subsequent values to the right.
     */
    insertFieldValue: <TField extends DeepKeys<TFormData>>(field: TField, index: number, value: DeepValue<TFormData, TField> extends any[] ? DeepValue<TFormData, TField>[number] : never, opts?: UpdateMetaOptions) => Promise<void>;
    /**
     * Replaces a value into an array field at the specified index.
     */
    replaceFieldValue: <TField extends DeepKeys<TFormData>>(field: TField, index: number, value: DeepValue<TFormData, TField> extends any[] ? DeepValue<TFormData, TField>[number] : never, opts?: UpdateMetaOptions) => Promise<void>;
    /**
     * Removes a value from an array field at the specified index.
     */
    removeFieldValue: <TField extends DeepKeys<TFormData>>(field: TField, index: number, opts?: UpdateMetaOptions) => Promise<void>;
    /**
     * Swaps the values at the specified indices within an array field.
     */
    swapFieldValues: <TField extends DeepKeys<TFormData>>(field: TField, index1: number, index2: number, opts?: UpdateMetaOptions) => void;
    /**
     * Moves the value at the first specified index to the second specified index within an array field.
     */
    moveFieldValues: <TField extends DeepKeys<TFormData>>(field: TField, index1: number, index2: number, opts?: UpdateMetaOptions) => void;
    /**
     * Updates the form's errorMap
     */
    setErrorMap(errorMap: ValidationErrorMap): void;
}
