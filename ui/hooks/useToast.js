import toast from 'react-hot-toast'

const style = {
  color: '#fff',
  background: 'rgb(0 0 0 / 33%)',
  padding: '5px 10px',
  fontSize: '12px'
}

function useToast(props = { position: 'bottom-center', style, duration: 3000 }) {
  const error = (msg) => {
    return toast(msg || 'Error', { ...props })
  }

  const success = (msg) => {
    toast.success(msg || 'Success', { ...props })
  }

  return { error, success }
}
export default useToast
