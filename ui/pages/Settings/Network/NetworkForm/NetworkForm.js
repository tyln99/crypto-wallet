import { ZButton } from '@ui/components/ZButtons'
import { startCase, upperFirst } from 'lodash'
import React, { useState } from 'react'
import './NetworkForm.scss'
import * as actions from '@store/actions'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useHistory } from 'react-router'
import { ACCOUNT_ROUTE } from '@shared/constant/routes'
import { useDispatch } from 'react-redux'
import { setSelectedNetwork } from '@actions/creator'
import { useTranslation } from 'react-i18next'

const formActions = {
  update: 'update',
  create: 'Create'
}

const defaultValue = {
  id: '',
  rpcUrl: '',
  chainId: '',
  name: '',
  currency: '',
  blockExplorer: '',
  isMutable: true
}

const AddCustomNetworkSchema = Yup.object().shape({
  rpcUrl: Yup.string()
    .url('Rpc url is not valid')
    .required('Rpc url is required'),
  chainId: Yup.string()
    .matches('0[xX][0-9a-fA-F]+', 'ChainId must be hex')
    .required('ChainId is required'),
  name: Yup.string().required('Name is required'),
  currency: Yup.string().required('Currency is required'),
  blockExplorer: Yup.string().url('Block explorer is not valid')
})

function NetworkForm({ initData = defaultValue, action, submit = () => {} }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const history = useHistory()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const onSubmit = async (values) => {
    try {
      switch (action) {
        case formActions.update:
          setIsSubmitting(true)
          await actions.updateCustomNetwork(values)
          setTimeout(() => {
            setIsSubmitting(false)
          }, 500)
          submit()
          break

        case formActions.create:
          const data = await actions.addCustomNetwork(values)
          const newNetwork = data[Object.keys(data)[0]]
          await actions.updateNetworkProvider(newNetwork)
          dispatch(setSelectedNetwork(newNetwork))
          return history.replace(ACCOUNT_ROUTE)
        default:
          break
      }
    } catch (error) {}
  }

  return (
    <div className="network-form">
      <Formik
        enableReinitialize
        initialValues={initData}
        validationSchema={AddCustomNetworkSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched }) => {
          return (
            <Form className="zForm">
              <fieldset disabled={!initData.isMutable}>
                {Object.keys(initData).map((key, index) => {
                  if (key === 'isMutable' || key === 'id') return null
                  return (
                    <div
                      key={index}
                      className={`form-group ${errors[key] && touched[key] && 'error'}`}
                    >
                      <label>{t(startCase(key))}</label>
                      <Field name={key} className="form-control" />
                      <p className="err-msg">{errors[key] && touched[key] && t(errors[key])}</p>
                    </div>
                  )
                })}
                <div className="group-btn">
                  <ZButton disabled={isSubmitting} type="reset" className="secondary">
                    {t('Reset')}
                  </ZButton>
                  <ZButton disabled={isSubmitting} type="submit">
                    {t(upperFirst(`${action}`))}
                    {isSubmitting ? 'ing...' : ''}
                  </ZButton>
                </div>
              </fieldset>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default NetworkForm
