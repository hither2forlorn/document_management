
import { useSelector } from 'react-redux'

function useIsSuperAdmin() {

    const user = useSelector(state => state.userProfile)
    const superAdmin = user.id === 1
    return superAdmin
}

export default useIsSuperAdmin
