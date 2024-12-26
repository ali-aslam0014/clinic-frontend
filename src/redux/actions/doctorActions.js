import axios from 'axios';
import {
  DOCTOR_DETAILS_REQUEST,
  DOCTOR_DETAILS_SUCCESS,
  DOCTOR_DETAILS_FAIL,
  DOCTOR_UPDATE_REQUEST,
  DOCTOR_UPDATE_SUCCESS,
  DOCTOR_UPDATE_FAIL
} from '../constants/doctorConstants';

// Get doctor details
export const getDoctorById = (id) => async (dispatch) => {
  try {
    dispatch({ type: DOCTOR_DETAILS_REQUEST });

    const { data } = await axios.get(`/api/doctors/${id}`);

    dispatch({
      type: DOCTOR_DETAILS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: DOCTOR_DETAILS_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};

// Update doctor
export const updateDoctor = (id, doctorData) => async (dispatch) => {
  try {
    dispatch({ type: DOCTOR_UPDATE_REQUEST });

    const { data } = await axios.put(`/api/doctors/${id}`, doctorData);

    dispatch({
      type: DOCTOR_UPDATE_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: DOCTOR_UPDATE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};