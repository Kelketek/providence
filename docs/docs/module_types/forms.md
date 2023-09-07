Forms provide a simple, unified state infrastructure for handling web forms, including validation, error handling, and submission.

## Form Controllers

Form controllers are instantiated much like other controllers, registering the relevant data elements in your state manager. Their syntax is a bit more verbose than other modules since the frontend handles much more of the data validation.

To get a new form controller:

=== "React/Redux"

    === "TypeScript"

        ```typescript
        import {useForm} from '@opencraft/providence-redux/hooks'
        
        // Declare a type in TypeScript to get type checking for your form's fields.
        // Note that if you do not explicitly create a type, TypeScript will attempt to infer the type
        // via the default values you place on the fields when instantiating the form.
        declare interface SurveyType {
          age: number,
          email: string,
          name: string,
        }
        
        const MyComponent = () => {
          controller = useForm<SurveyType>('survey', {
            endpoint: 'https://example.com/api/survey/',
            fields: {
              age: {value: 20},
              email: {value: '', validators: [{name: 'email'}]},
              name: {value: ''},
            }
          })
          // ... The rest of your component code goes here!
        }
        ```

    === "JavaScript"

        ```javascript
        import {useForm} from '@opencraft/providence-redux/hooks'

        const MyComponent = () => {
           controller = useForm('survey', {
             endpoint: 'https://example.com/api/survey/',
             fields: {
               age: {value: 20},
               email: {value: '', validators: [{name: 'email'}]},
               name: {value: ''},
             }
           })
          // ... The rest of your component code goes here!
        }
        ```

=== "Vue/Pinia"

    === "TypeScript"

        ```typescript
        // Coming once the Pinia module is completed.
        ```

    === "JavaScript"

        ```
        // Coming once the Pinia module is completed.
        ```

Usually, the best way to leverage the capability of forms is to make components in your favorite frontend framework that
integrate the input elements with Providence's controllers. The best examples for this can be found in the
[Demo code](https://gitlab.com/opencraft/dev/providence-demo/-/tree/main/src/components?ref_type=heads).


## Form Module Options

Forms have a handful of parameters which can be set upon instantiation.

[Check the Form Module Options Reference here.](../reference/providence/interfaces/forms_types_FormModuleOptions.FormModuleOptions.md)


## Field Options

Fields on forms may have several options set. For instance, they can have individual validators, initial values, and 'steps', for cases where a form may have several stages to fill out.

[Check the reference of all field options here.](../reference/providence/interfaces/forms_types_FieldOptions.FieldOptions.md)


## Validators

Fields may have validators assigned to them. Validators are asynchronous functions that take some context information about a field's current value and return an array of strings with any errors found when validating. This flexibility allows for both simple data validation, such as verifying if a number is within a certain range, as well as remote validation, such as contacting a server to see if a username has been taken.

Validators are added to Providence in the [global configuration in the validators setting](../configuration.md#validators) . Providence comes with an example `email` validator. The validator gives useful feedback about what's wrong with a user's email entry while avoiding most regex validation pitfalls.

[Check the ValidatorArgs reference documentation here.](../reference/providence/interfaces/forms_types_ValidatorArgs.ValidatorArgs.md)


## Controller Reference

The form controller is your interface for managing your form. :ref:`Check here for a primer on controllers as a concept.<Concepts:Controllers>`

[Check the full Form Controller reference here.](../reference/providence/interfaces/forms_types_FormController.FormController.md)

## Fielders

Fielders are a special, controller-like wrapper around the fields of forms, much like [patchers for singles](singles.md#patchers). They handle updates to the field's value and triggering validation. This is especially useful for cases like Vue's `v-model`, but also allows for more terse functions in the case of React's event listeners.

Say you had a form for a Survey:

```typescript
declare interface Product {
  age: number,
  email: string,
  name: string,
}

const controller = useForm<SurveyType>('survey', {
  endpoint: 'https://example.com/api/survey/',
  fields: {
  age: {value: 20},
  // We use the `email` validator for the email field.
  email: {value: '', validators: [{name: 'email'}]},
  name: {value: ''},
  }
})
```

You could update the value of `email` by setting its value on the autogenerated fielder:

```typescript
// Output: ''
console.log(controller.f.email)

controller.f.email.model = 'test'
// Output: [], since validation is debounced.
console.log(controller.f.email.errors)
// Force validators to run now instead of in a few hundred milliseconds.
controller.f.email.validate.flush().then(() => {
   // Output: ['Emails must contain an @ in the middle.']
   console.log(controller.f.email.errors)
})
```


The fielder automatically takes care of validating the value for you, and also manages the errors for that particular field, making it easy to create input controls that validate and display timely errors in your frontend component/template framework of choice.

[Check the full Fielder reference here.](../reference/providence/interfaces/forms_types_Fielder.Fielder.md)
