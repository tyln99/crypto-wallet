import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { ZButton } from '@ui/components/ZButtons'
import * as actions from '@store/actions'
import { useTranslation } from 'react-i18next'

const NAME_FIELD = 'accountName'

function EditAccountNameForm({
  onSubmit,
  onCancel,
  okText = 'Create',
  cancelText = 'Cancel',
  initValues = { [NAME_FIELD]: '' }
}) {
  const [contacts, setContacts] = useState({})
  const { t } = useTranslation()

  useEffect(() => {
    fetchNames()
  }, [])

  const fetchNames = async () => {
    try {
      setContacts(await actions.getContacts())
    } catch (error) {}
  }

  const checkExistsName = (newName) => {
    for (const address in contacts) {
      if (contacts[address]?.name === newName?.trim()) {
        return true
      }
    }
    return false
  }

  Yup.addMethod(Yup.string, 'nameExistsValidate', function(err) {
    return this.test('test-name-validity', err, function(value) {
      const { path, createError } = this
      if (checkExistsName(value)) {
        return createError({ path, message: err })
      }
      return true
    })
  })

  const nameSchema = Yup.object().shape({
    [NAME_FIELD]: Yup.string()
      .required(`Account name is required`)
      .nameExistsValidate(`Account name is already exists`)
  })

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: nameSchema,
    onSubmit: onSubmit,
    enableReinitialize: true
  })
  // console.log(formik.errors)

  const handleOnCancel = () => {
    formik.resetForm()
    onCancel()
  }

  //   console.count('FORM rerender', initValues)

  return (
    <form
      className="zForm"
      onSubmit={async (e) => {
        e.preventDefault()
        await formik.submitForm()
        fetchNames() // refetch names
      }}
    >
      <div
        className={`form-group ${formik.errors[NAME_FIELD] &&
          formik.touched[NAME_FIELD] &&
          'error'}`}
      >
        <label>{t('Account name')}</label>
        <input
          className="form-control"
          name={NAME_FIELD}
          value={formik.values[NAME_FIELD]}
          onChange={(e) => formik.setFieldValue([NAME_FIELD], e.target.value)}
          onBlur={formik.handleBlur}
        />
        <p className="err-msg">
          {formik.errors[NAME_FIELD] && formik.touched[NAME_FIELD] && t(formik.errors[NAME_FIELD])}
        </p>
      </div>
      <div className="btn-group">
        <ZButton className="secondary" type="reset" onClick={handleOnCancel}>
          {cancelText}
        </ZButton>
        <ZButton disabled={formik.isSubmitting || !formik.isValid} type="submit">
          {okText}
        </ZButton>
      </div>
    </form>
  )
}

export default EditAccountNameForm
