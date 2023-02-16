import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { isAddress } from 'web3-utils'
import { ZButton } from '@ui/components/ZButtons'
import * as actions from '@store/actions'
import { useTranslation } from 'react-i18next'

const NAME_FIELD = 'accountName'
const ADDRESS_FIELD = 'address'

function ContactForm({
  onSubmit,
  onCancel,
  okText = 'Create',
  cancelText = 'Cancel',
  initValues = { [NAME_FIELD]: '', [ADDRESS_FIELD]: '' }
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

  const checkExistsName = (name) => {
    for (const address in contacts) {
      if (contacts[address].name === name) {
        return true
      }
    }
    return false
  }

  Yup.addMethod(Yup.string, 'nameExistsValidate', function(err) {
    return this.test('test-name-validity', err, function(name) {
      const { path, createError } = this
      if (checkExistsName(name)) {
        return createError({ path, message: `Account name is already exists` })
      }
      return true
    })
  })

  Yup.addMethod(Yup.string, 'addressValidate', function(err) {
    return this.test('test-address-validity', err, function(value) {
      const { path, createError } = this
      return isAddress(value) || createError({ path, message: err })
    })
  })

  const nameSchema = Yup.object().shape({
    [NAME_FIELD]: Yup.string()
      .required(`Account name is required`)
      .nameExistsValidate(),
    [ADDRESS_FIELD]: Yup.string()
      .required(`Address is required`)
      .addressValidate(`Address is not valid`)
  })

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: nameSchema,
    onSubmit: onSubmit,
    enableReinitialize: true
  })

  const handleOnCancel = () => {
    formik.resetForm()
    onCancel && onCancel()
  }

  //   console.count('FORM rerender', initValues)

  return (
    <form
      className="zForm"
      onSubmit={async (e) => {
        e.preventDefault()
        await formik.submitForm()
        fetchNames()
      }}
    >
      <div
        className={`form-group ${
          formik.errors[ADDRESS_FIELD] && formik.touched[ADDRESS_FIELD] ? 'error' : ''
        }`}
      >
        <label>{t('Address')}</label>
        <input
          className="form-control"
          name={ADDRESS_FIELD}
          value={formik.values[ADDRESS_FIELD]}
          onChange={(e) => formik.setFieldValue([ADDRESS_FIELD], e.target.value)}
          onBlur={formik.handleBlur}
        />
        <p className="err-msg">
          {formik.errors[ADDRESS_FIELD] && formik.touched[ADDRESS_FIELD]
            ? t(formik.errors[ADDRESS_FIELD])
            : ''}
        </p>
      </div>
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

export default ContactForm
