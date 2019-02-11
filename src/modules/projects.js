import Immutable from 'seamless-immutable'
import api from '../lib/api'

// Actions
const SET_PROJECTS = 'jt/projects/SET_PROJECTS'
const SET_FETCHING = 'jt/projects/SET_FETCHING'

const initialState = Immutable({
  list: [],
  fetching: false
})

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {

    case SET_PROJECTS: {
      return state.set('list', Immutable(action.projects))
    }

    default: return state
  }
}

// Action Creators
export const updateProjects = projects => ({
  type: SET_PROJECTS,
  projects
})

// Side effects
export const fetchProjects = () => async dispatch => {
  console.log('Fetching all projects')

  dispatch({ type: SET_FETCHING, fetching: true })

  try {
    let projects = await api.get('/project?expand=issueTypes')
    dispatch(updateProjects(projects))
    dispatch({ type: SET_FETCHING, fetching: false })
  } catch (error) {
    console.log('Error fetching projects', error)
    dispatch({ type: SET_FETCHING, fetching: false })
  }
}
