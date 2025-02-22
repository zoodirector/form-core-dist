"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const store = require("@tanstack/store");
const utils = require("./utils.cjs");
function getDefaultFormState(defaultState) {
  return {
    values: defaultState.values ?? {},
    errors: defaultState.errors ?? [],
    errorMap: defaultState.errorMap ?? {},
    fieldMeta: defaultState.fieldMeta ?? {},
    canSubmit: defaultState.canSubmit ?? true,
    isFieldsValid: defaultState.isFieldsValid ?? false,
    isFieldsValidating: defaultState.isFieldsValidating ?? false,
    isFormValid: defaultState.isFormValid ?? false,
    isFormValidating: defaultState.isFormValidating ?? false,
    isSubmitted: defaultState.isSubmitted ?? false,
    isSubmitting: defaultState.isSubmitting ?? false,
    isTouched: defaultState.isTouched ?? false,
    isBlurred: defaultState.isBlurred ?? false,
    isPristine: defaultState.isPristine ?? true,
    isDirty: defaultState.isDirty ?? false,
    isValid: defaultState.isValid ?? false,
    isValidating: defaultState.isValidating ?? false,
    submissionAttempts: defaultState.submissionAttempts ?? 0,
    validationMetaMap: defaultState.validationMetaMap ?? {
      onChange: void 0,
      onBlur: void 0,
      onSubmit: void 0,
      onMount: void 0,
      onServer: void 0
    }
  };
}
const isFormValidationError = (error) => {
  return typeof error === "object";
};
class FormApi {
  /**
   * Constructs a new `FormApi` instance with the given form options.
   */
  constructor(opts) {
    var _a;
    this.options = {};
    this.fieldInfo = {};
    this.prevTransformArray = [];
    this.mount = () => {
      const { onMount } = this.options.validators || {};
      if (!onMount) return;
      const error = this.runValidator({
        validate: onMount,
        value: {
          value: this.state.values,
          formApi: this,
          validationSource: "form"
        },
        type: "validate"
      });
      if (error) {
        this.store.setState((prev) => ({
          ...prev,
          errorMap: { ...prev.errorMap, onMount: error }
        }));
      }
    };
    this.update = (options) => {
      if (!options) return;
      const oldOptions = this.options;
      this.options = options;
      this.store.batch(() => {
        const shouldUpdateValues = options.defaultValues && options.defaultValues !== oldOptions.defaultValues && !this.state.isTouched;
        const shouldUpdateState = options.defaultState !== oldOptions.defaultState && !this.state.isTouched;
        this.store.setState(
          () => getDefaultFormState(
            Object.assign(
              {},
              this.state,
              shouldUpdateState ? options.defaultState : {},
              shouldUpdateValues ? {
                values: options.defaultValues
              } : {}
            )
          )
        );
      });
    };
    this.reset = () => {
      const { fieldMeta: currentFieldMeta } = this.state;
      const fieldMeta = this.resetFieldMeta(currentFieldMeta);
      this.store.setState(
        () => {
          var _a2;
          return getDefaultFormState({
            ...this.options.defaultState,
            values: this.options.defaultValues ?? ((_a2 = this.options.defaultState) == null ? void 0 : _a2.values),
            fieldMeta
          });
        }
      );
    };
    this.validateAllFields = async (cause) => {
      const fieldValidationPromises = [];
      this.store.batch(() => {
        void Object.values(this.fieldInfo).forEach((field) => {
          if (!field.instance) return;
          const fieldInstance = field.instance;
          fieldValidationPromises.push(
            Promise.resolve().then(() => fieldInstance.validate(cause))
          );
          if (!field.instance.state.meta.isTouched) {
            field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
          }
          if (!field.instance.state.meta.isBlurred) {
            field.instance.setMeta((prev) => ({ ...prev, isBlurred: true }));
          }
        });
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateArrayFieldsStartingFrom = async (field, index, cause) => {
      const currentValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(currentValue) ? Math.max(currentValue.length - 1, 0) : null;
      const fieldKeysToValidate = [`${field}[${index}]`];
      for (let i = index + 1; i <= (lastIndex ?? 0); i++) {
        fieldKeysToValidate.push(`${field}[${i}]`);
      }
      const fieldsToValidate = Object.keys(this.fieldInfo).filter(
        (fieldKey) => fieldKeysToValidate.some((key) => fieldKey.startsWith(key))
      );
      const fieldValidationPromises = [];
      this.store.batch(() => {
        fieldsToValidate.forEach((nestedField) => {
          fieldValidationPromises.push(
            Promise.resolve().then(() => this.validateField(nestedField, cause))
          );
        });
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateField = (field, cause) => {
      var _a2;
      const fieldInstance = (_a2 = this.fieldInfo[field]) == null ? void 0 : _a2.instance;
      if (!fieldInstance) return [];
      if (!fieldInstance.state.meta.isTouched) {
        fieldInstance.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      if (!fieldInstance.state.meta.isBlurred) {
        fieldInstance.setMeta((prev) => ({ ...prev, isBlurred: true }));
      }
      return fieldInstance.validate(cause);
    };
    this.validateSync = (cause) => {
      const validates = utils.getSyncValidatorArray(cause, this.options);
      let hasErrored = false;
      const fieldsErrorMap = {};
      this.store.batch(() => {
        for (const validateObj of validates) {
          if (!validateObj.validate) continue;
          const rawError = this.runValidator({
            validate: validateObj.validate,
            value: {
              value: this.state.values,
              formApi: this,
              validationSource: "form"
            },
            type: "validate"
          });
          const { formError, fieldErrors } = normalizeError(rawError);
          const errorMapKey = getErrorMapKey(validateObj.cause);
          if (fieldErrors) {
            for (const [field, fieldError] of Object.entries(fieldErrors)) {
              const oldErrorMap = fieldsErrorMap[field] || {};
              const newErrorMap = {
                ...oldErrorMap,
                [errorMapKey]: fieldError
              };
              fieldsErrorMap[field] = newErrorMap;
              const fieldMeta = this.getFieldMeta(field);
              if (fieldMeta && fieldMeta.errorMap[errorMapKey] !== fieldError) {
                this.setFieldMeta(field, (prev) => ({
                  ...prev,
                  errorMap: {
                    ...prev.errorMap,
                    [errorMapKey]: fieldError
                  }
                }));
              }
            }
          }
          if (this.state.errorMap[errorMapKey] !== formError) {
            this.store.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
          }
          if (formError || fieldErrors) {
            hasErrored = true;
          }
        }
      });
      const submitErrKey = getErrorMapKey("submit");
      if (this.state.errorMap[submitErrKey] && cause !== "submit" && !hasErrored) {
        this.store.setState((prev) => ({
          ...prev,
          errorMap: {
            ...prev.errorMap,
            [submitErrKey]: void 0
          }
        }));
      }
      return { hasErrored, fieldsErrorMap };
    };
    this.validateAsync = async (cause) => {
      const validates = utils.getAsyncValidatorArray(cause, this.options);
      if (!this.state.isFormValidating) {
        this.store.setState((prev) => ({ ...prev, isFormValidating: true }));
      }
      const promises = [];
      let fieldErrors;
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        const key = getErrorMapKey(validateObj.cause);
        const fieldValidatorMeta = this.state.validationMetaMap[key];
        fieldValidatorMeta == null ? void 0 : fieldValidatorMeta.lastAbortController.abort();
        const controller = new AbortController();
        this.state.validationMetaMap[key] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                setTimeout(async () => {
                  if (controller.signal.aborted) return rawResolve(void 0);
                  try {
                    rawResolve(
                      await this.runValidator({
                        validate: validateObj.validate,
                        value: {
                          value: this.state.values,
                          formApi: this,
                          validationSource: "form",
                          signal: controller.signal
                        },
                        type: "validateAsync"
                      })
                    );
                  } catch (e) {
                    rawReject(e);
                  }
                }, validateObj.debounceMs);
              });
            } catch (e) {
              rawError = e;
            }
            const { formError, fieldErrors: fieldErrorsFromNormalizeError } = normalizeError(rawError);
            if (fieldErrorsFromNormalizeError) {
              fieldErrors = fieldErrors ? { ...fieldErrors, ...fieldErrorsFromNormalizeError } : fieldErrorsFromNormalizeError;
            }
            const errorMapKey = getErrorMapKey(validateObj.cause);
            if (fieldErrors) {
              for (const [field, fieldError] of Object.entries(fieldErrors)) {
                const fieldMeta = this.getFieldMeta(field);
                if (fieldMeta && fieldMeta.errorMap[errorMapKey] !== fieldError) {
                  this.setFieldMeta(field, (prev) => ({
                    ...prev,
                    errorMap: {
                      ...prev.errorMap,
                      [errorMapKey]: fieldError
                    }
                  }));
                }
              }
            }
            this.store.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
            resolve(fieldErrors ? { fieldErrors, errorMapKey } : void 0);
          })
        );
      }
      let results = [];
      const fieldsErrorMap = {};
      if (promises.length) {
        results = await Promise.all(promises);
        for (const fieldValidationResult of results) {
          if (fieldValidationResult == null ? void 0 : fieldValidationResult.fieldErrors) {
            const { errorMapKey } = fieldValidationResult;
            for (const [field, fieldError] of Object.entries(
              fieldValidationResult.fieldErrors
            )) {
              const oldErrorMap = fieldsErrorMap[field] || {};
              const newErrorMap = {
                ...oldErrorMap,
                [errorMapKey]: fieldError
              };
              fieldsErrorMap[field] = newErrorMap;
            }
          }
        }
      }
      this.store.setState((prev) => ({
        ...prev,
        isFormValidating: false
      }));
      return fieldsErrorMap;
    };
    this.validate = (cause) => {
      const { hasErrored, fieldsErrorMap } = this.validateSync(cause);
      if (hasErrored && !this.options.asyncAlways) {
        return fieldsErrorMap;
      }
      return this.validateAsync(cause);
    };
    this.handleSubmit = async () => {
      var _a2, _b, _c, _d, _e, _f;
      this.store.setState((old) => ({
        ...old,
        // Submission attempts mark the form as not submitted
        isSubmitted: false,
        // Count submission attempts
        submissionAttempts: old.submissionAttempts + 1
      }));
      if (!this.state.canSubmit) return;
      this.store.setState((d) => ({ ...d, isSubmitting: true }));
      const done = () => {
        this.store.setState((prev) => ({ ...prev, isSubmitting: false }));
      };
      await this.validateAllFields("submit");
      if (!this.state.isFieldsValid) {
        done();
        (_b = (_a2 = this.options).onSubmitInvalid) == null ? void 0 : _b.call(_a2, {
          value: this.state.values,
          formApi: this
        });
        return;
      }
      await this.validate("submit");
      if (!this.state.isValid) {
        done();
        (_d = (_c = this.options).onSubmitInvalid) == null ? void 0 : _d.call(_c, {
          value: this.state.values,
          formApi: this
        });
        return;
      }
      try {
        const result = await ((_f = (_e = this.options).onSubmit) == null ? void 0 : _f.call(_e, {
          value: this.state.values,
          formApi: this
        }));
        this.store.batch(() => {
          this.store.setState((prev) => ({ ...prev, isSubmitted: true }));
          done();
        });
        return result;
      } catch (err) {
        done();
        throw err;
      }
    };
    this.getFieldValue = (field) => utils.getBy(this.state.values, field);
    this.getFieldMeta = (field) => {
      return this.state.fieldMeta[field];
    };
    this.getFieldInfo = (field) => {
      var _a2;
      return (_a2 = this.fieldInfo)[field] || (_a2[field] = {
        instance: null,
        validationMetaMap: {
          onChange: void 0,
          onBlur: void 0,
          onSubmit: void 0,
          onMount: void 0,
          onServer: void 0
        }
      });
    };
    this.setFieldMeta = (field, updater) => {
      this.store.setState((prev) => {
        return {
          ...prev,
          fieldMeta: {
            ...prev.fieldMeta,
            [field]: utils.functionalUpdate(updater, prev.fieldMeta[field])
          }
        };
      });
    };
    this.resetFieldMeta = (fieldMeta) => {
      return Object.keys(fieldMeta).reduce(
        (acc, key) => {
          const fieldKey = key;
          acc[fieldKey] = {
            isValidating: false,
            isTouched: false,
            isBlurred: false,
            isDirty: false,
            isPristine: true,
            errors: [],
            errorMap: {}
          };
          return acc;
        },
        {}
      );
    };
    this.setFieldValue = (field, updater, opts2) => {
      const dontUpdateMeta = (opts2 == null ? void 0 : opts2.dontUpdateMeta) ?? false;
      this.store.batch(() => {
        if (!dontUpdateMeta) {
          this.setFieldMeta(field, (prev) => ({
            ...prev,
            isTouched: true,
            isBlurred: true,
            isDirty: true
          }));
        }
        this.store.setState((prev) => {
          return {
            ...prev,
            values: utils.setBy(prev.values, field, updater)
          };
        });
      });
    };
    this.deleteField = (field) => {
      this.store.setState((prev) => {
        const newState = { ...prev };
        newState.values = utils.deleteBy(newState.values, field);
        delete newState.fieldMeta[field];
        return newState;
      });
      delete this.fieldInfo[field];
    };
    this.pushFieldValue = (field, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => [...Array.isArray(prev) ? prev : [], value],
        opts2
      );
      this.validateField(field, "change");
    };
    this.insertFieldValue = async (field, index, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          return [
            ...prev.slice(0, index),
            value,
            ...prev.slice(index)
          ];
        },
        opts2
      );
      await this.validateField(field, "change");
    };
    this.replaceFieldValue = async (field, index, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          return prev.map(
            (d, i) => i === index ? value : d
          );
        },
        opts2
      );
      await this.validateField(field, "change");
      await this.validateArrayFieldsStartingFrom(field, index, "change");
    };
    this.removeFieldValue = async (field, index, opts2) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(
        field,
        (prev) => {
          return prev.filter(
            (_d, i) => i !== index
          );
        },
        opts2
      );
      if (lastIndex !== null) {
        const start = `${field}[${lastIndex}]`;
        const fieldsToDelete = Object.keys(this.fieldInfo).filter(
          (f) => f.startsWith(start)
        );
        fieldsToDelete.forEach((f) => this.deleteField(f));
      }
      await this.validateField(field, "change");
      await this.validateArrayFieldsStartingFrom(field, index, "change");
    };
    this.swapFieldValues = (field, index1, index2, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          const prev1 = prev[index1];
          const prev2 = prev[index2];
          return utils.setBy(utils.setBy(prev, `${index1}`, prev2), `${index2}`, prev1);
        },
        opts2
      );
      this.validateField(field, "change");
      this.validateField(`${field}[${index1}]`, "change");
      this.validateField(`${field}[${index2}]`, "change");
    };
    this.moveFieldValues = (field, index1, index2, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          prev.splice(index2, 0, prev.splice(index1, 1)[0]);
          return prev;
        },
        opts2
      );
      this.validateField(field, "change");
      this.validateField(`${field}[${index1}]`, "change");
      this.validateField(`${field}[${index2}]`, "change");
    };
    this.store = new store.Store(
      getDefaultFormState({
        ...opts == null ? void 0 : opts.defaultState,
        values: (opts == null ? void 0 : opts.defaultValues) ?? ((_a = opts == null ? void 0 : opts.defaultState) == null ? void 0 : _a.values),
        isFormValid: true
      }),
      {
        onUpdate: () => {
          var _a2, _b;
          let { state } = this.store;
          const fieldMetaValues = Object.values(state.fieldMeta);
          const isFieldsValidating = fieldMetaValues.some(
            (field) => field == null ? void 0 : field.isValidating
          );
          const isFieldsValid = !fieldMetaValues.some(
            (field) => (field == null ? void 0 : field.errorMap) && utils.isNonEmptyArray(Object.values(field.errorMap).filter(Boolean))
          );
          const isTouched = fieldMetaValues.some((field) => field == null ? void 0 : field.isTouched);
          const isBlurred = fieldMetaValues.some((field) => field == null ? void 0 : field.isBlurred);
          const isDirty = fieldMetaValues.some((field) => field == null ? void 0 : field.isDirty);
          const isPristine = !isDirty;
          const isValidating = isFieldsValidating || state.isFormValidating;
          state.errors = Object.values(state.errorMap).reduce((prev, curr) => {
            if (curr === void 0) return prev;
            if (typeof curr === "string") {
              prev.push(curr);
              return prev;
            } else if (curr && isFormValidationError(curr)) {
              prev.push(curr.form);
              return prev;
            }
            return prev;
          }, []);
          const isFormValid = state.errors.length === 0;
          const isValid = isFieldsValid && isFormValid;
          const canSubmit = state.submissionAttempts === 0 && !isTouched || !isValidating && !state.isSubmitting && isValid;
          state = {
            ...state,
            isFieldsValidating,
            isFieldsValid,
            isFormValid,
            isValid,
            canSubmit,
            isTouched,
            isBlurred,
            isPristine,
            isDirty
          };
          this.state = state;
          this.store.state = this.state;
          const transformArray = ((_a2 = this.options.transform) == null ? void 0 : _a2.deps) ?? [];
          const shouldTransform = transformArray.length !== this.prevTransformArray.length || transformArray.some((val, i) => val !== this.prevTransformArray[i]);
          if (shouldTransform) {
            (_b = this.options.transform) == null ? void 0 : _b.fn(this);
            this.store.state = this.state;
            this.prevTransformArray = transformArray;
          }
        }
      }
    );
    this.state = this.store.state;
    this.update(opts || {});
  }
  /**
   * @private
   */
  runValidator(props) {
    const adapter = this.options.validatorAdapter;
    if (adapter && typeof props.validate !== "function") {
      return adapter()[props.type](props.value, props.validate);
    }
    return props.validate(props.value);
  }
  /**
   * Updates the form's errorMap
   */
  setErrorMap(errorMap) {
    this.store.setState((prev) => ({
      ...prev,
      errorMap: {
        ...prev.errorMap,
        ...errorMap
      }
    }));
  }
}
function normalizeError(rawError) {
  if (rawError) {
    if (typeof rawError === "object") {
      const formError = normalizeError(rawError.form).formError;
      const fieldErrors = rawError.fields;
      return { formError, fieldErrors };
    }
    if (typeof rawError !== "string") {
      return { formError: "Invalid Form Values" };
    }
    return { formError: rawError };
  }
  return { formError: void 0 };
}
function getErrorMapKey(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "change":
    default:
      return "onChange";
  }
}
exports.FormApi = FormApi;
//# sourceMappingURL=FormApi.cjs.map
