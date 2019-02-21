import api from '../lib/api'

const getTaskTransitions = async taskKey => {
  try {
    let getTransitions = await api.get(`/issue/${taskKey}/transitions`)

    console.log({ getTransitions })

    let transitions = []

    getTransitions.transitions.forEach(transition => {
      transitions.push({
        label: transition.name,
        async click() {
          try {
            await api.post(`/issue/${taskKey}/transitions`, {
              transition: {
                id: transition.id
              }
            })

            console.log('Transitioned status')

            new Notification(`${taskKey} transitioned`, {
              body: `${taskKey} transitioned status to ${transition.name}`
            })

          } catch (error) {
            console.error('Failed to transition issue')

            new Notification(`Failed to transition issue`, {
              body: `${taskKey} failed to transition, please try again`
            })
          }
        }
      })
    })

    return transitions
  } catch (error) {
    console.error('Error fetching issue transitions', error)
    return false
  }
}

export default getTaskTransitions
