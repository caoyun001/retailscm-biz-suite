

import pathToRegexp from 'path-to-regexp'
import { routerRedux } from 'dva/router'
import { notification } from 'antd'
import GlobalComponents from '../../custcomponents';

import modeltool from '../../utils/modeltool'
const {setupModel,hasError,handleClientError,handleServerError,keepValueWithKeySuffix}=modeltool


export default {

  namespace: '_occupationType',

  state: {},

  subscriptions: {
    
    setup({ dispatch, history }) { 
      history.listen((location) => {
      	const modelName = 'occupationType'
      	const parameter = {dispatch,history,location,modelName}
        //console.log("setupModel",setupModel,typeof(setupModel))
      	setupModel(parameter)

      })
    },
  },
  effects: {
    *view({ payload }, { call, put, select }) { 
    
      const cachedData = yield select(state => state._occupationType)
      //if the data in the cache, just show it, there is no delay
      const link = payload.pathname
      //if the data in the cache, just show it, there is no delay
      if(cachedData.class){
        //yield put({ type: 'breadcrumb/gotoLink', payload: { displayName:cachedData.displayName,link }} )
        yield put({ type: 'updateState', payload: cachedData })
      }else{
        yield put({ type: 'showLoading', payload })
      }
      
      const {OccupationTypeService} = GlobalComponents;
      const data = yield call(OccupationTypeService.view, payload.id)
      
      const displayName = payload.displayName||data.displayName
      
      
      yield put({ type: 'breadcrumb/gotoLink', payload: { displayName,link }} )
      

      yield put({ type: 'updateState', payload: data })
    },
    *load({ payload }, { call, put }) { 
      const {OccupationTypeService} = GlobalComponents;
      //yield put({ type: 'showLoading', payload })
      const data = yield call(OccupationTypeService.load, payload.id, payload.parameters)
      const newPlayload = { ...payload, ...data }
      
      console.log('this is the data id: ', data.id)
      yield put({ type: 'updateState', payload: newPlayload })
    },
    
    *doJob({ payload }, { call, put }) { 
      const {TaskService} = GlobalComponents;
      //yield put({ type: 'showLoading', payload })      
      const {serviceNameToCall, id, parameters} = payload;
      if(!serviceNameToCall){
      	handleClientError("没有提供后台服务的名字, 该服务没有注册")
      	return;
      }
      
      
      const data = yield call(serviceNameToCall, id, parameters)
      if(handleServerError(data)){
      	return
      }
      const newPlayload = { ...payload, ...data }
      
      console.log('this is the data id: ', data.id)
      yield put({ type: 'updateState', payload: newPlayload })
    },
       
    
    
    *gotoCreateForm({ payload }, { put }) {
      const { id, role } = payload
      yield put(routerRedux.push(`/occupationType/${id}/list/${role}CreateForm`))
    },
    *gotoUpdateForm({ payload }, { put }) {
      const { id, role, selectedRows, currentUpdateIndex } = payload
      const state = { id, role, selectedRows, currentUpdateIndex }
      const location = { pathname: `/occupationType/${id}/list/${role}UpdateForm`, state }
      yield put(routerRedux.push(location))
    },
    *goback({ payload }, { put }) {
      const { id, type,listName } = payload
      yield put(routerRedux.push(`/occupationType/${id}/list/${type}List/${listName}`))
    },




    *addEmployee({ payload }, { call, put }) {
      const {OccupationTypeService} = GlobalComponents;

      const { id, role, parameters, continueNext } = payload
      console.log('get form parameters', parameters)
      const data = yield call(OccupationTypeService.addEmployee, id, parameters)
      if (hasError(data)) {
        handleServerError(data)
        return
      }
      const newPlayload = { ...payload, ...data }
      yield put({ type: 'updateState', payload: newPlayload })
      // yield put(routerRedux.push(`/occupationType/${id}/list/${role}CreateForm'))
      notification.success({
        message: '执行成功',
        description: '执行成功',
      })
      if (continueNext) {
        return
      }
      const partialList = true
      const newState = {...data, partialList}
      const location = { pathname: `/occupationType/${id}/list/\EmployeeList/员工列表`, state: newState }
      yield put(routerRedux.push(location))
    },
    *updateEmployee({ payload }, { call, put }) {
      const {OccupationTypeService} = GlobalComponents;      
      const { id, type, parameters, continueNext, selectedRows, currentUpdateIndex } = payload
      console.log('get form parameters', parameters)
      const data = yield call(OccupationTypeService.updateEmployee, id, parameters)
      if (hasError(data)) {
        handleServerError(data)
        return
      }
      const partialList = true
      
      const newPlayload = { ...payload, ...data, selectedRows, currentUpdateIndex,partialList }
      yield put({ type: 'updateState', payload: newPlayload })
      notification.success({
        message: '执行成功',
        description: '执行成功',
      })
      
      if (continueNext) {
        return
      }
      const location = { pathname: `/occupationType/${id}/list/\EmployeeList/员工列表`, state: newPlayload }
      yield put(routerRedux.push(location))
    },
    *gotoNextEmployeeUpdateRow({ payload }, { call, put }) {
      const { id, type, parameters, continueNext, selectedRows, currentUpdateIndex } = payload
      const newPlayload = { ...payload, selectedRows, currentUpdateIndex }
      yield put({ type: 'updateState', payload: newPlayload })
    },
    *removeEmployeeList({ payload }, { call, put }) {
      const {OccupationTypeService} = GlobalComponents; 
      const { id, role, parameters, continueNext } = payload
      console.log('get form parameters', parameters)
      const data = yield call(OccupationTypeService.removeEmployeeList, id, parameters)
      if (hasError(data)) {
        handleServerError(data)
        return
      }
      const newPlayload = { ...payload, ...data }

      yield put({ type: 'updateState', payload: newPlayload })
        
     
      notification.success({
        message: '执行成功',
        description: '执行成功',
      })

    },

  },
  
  reducers: {
    updateState(state, action) {
      const payload = { ...action.payload, loading: true }
      const valueToKeep = keepValueWithKeySuffix(state,"Parameters") 
      return { ...valueToKeep, ...payload}
    },
    showLoading(state, action) {
      // const loading=true
      const payload = { ...action.payload, loading: true }
      const valueToKeep = keepValueWithKeySuffix(state,"Parameters") 
      return { ...valueToKeep, ...payload}
    },
  },
}
