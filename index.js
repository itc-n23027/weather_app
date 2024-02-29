import React, { useState, useEffect, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'

const weatherDescriptionMap = {
  Cliar: '晴れ',
  Cllouds: '曇り',
  Rain: '雨',
  brokenclouds: '部分的に曇り'
}

const Weather = ({ weatherData, astronomyPicture }) => {
  const { name, main, weather } = weatherData

  const kelvinToCelsius = kelvin => {
    return (kelvin - 273.15).toFixed(2)
  }

  const weatherStyle = {
    backgroundImage: `url(${astronomyPicture})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    padding: '20px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }

  return (
    <div style={weatherStyle}>
      <h1>{name}の天気</h1>
      <p>気温: {kelvinToCelsius(main.temp)} °C</p>
      <p>
        天気:{' '}
        {weatherDescriptionMap[weather[0].description] ||
          weather[0].description}
      </p>
    </div>
  )
}

const App = () => {
  const [city, setCity] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weatherData, setWeatherData] = useState(null)
  const [astronomyPicture, setAstronomyPicture] = useState(null)
  const [error, setError] = useState(null)

  const updateWindowDimensions = useCallback(() => {
    const getAstronomyPicture = async () => {
      try {
        const nasaApiKey = 'fDlVALNuPbgnCVbP6iDtTNBLxK5pBBD69ka5Dc2W'
        const nasaApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`
        const nasaResponse = await axios.get(nasaApiUrl)
        setAstronomyPicture(nasaResponse.data.url)
      } catch (error) {
        console.error('NASA APIからのデータの取得エラー:', error)
        setAstronomyPicture(null)
      }
    }

    getAstronomyPicture()
  }, [])

  useEffect(() => {
    updateWindowDimensions()
    window.addEventListener('resize', updateWindowDimensions)
    return () => {
      window.removeEventListener('resize', updateWindowDimensions)
    }
  }, [updateWindowDimensions])

  const getAstronomyPicture = async date => {
    try {
      const nasaApiKey = 'fDlVALNuPbgnCVbP6iDtTNBLxK5pBBD69ka5Dc2W'
      const nasaApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&date=${date}`
      const nasaResponse = await axios.get(nasaApiUrl)
      setAstronomyPicture(nasaResponse.data.url)
    } catch (error) {
      console.error('NASA APIからのデータの取得エラー:', error)
      setAstronomyPicture(null)
    }
  }

  const getWeatherData = async () => {
    try {
      const openWeatherMapApiKey = '5d08d821e75ed5eed7d00beaad0b1f71'
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherMapApiKey}`
      const response = await axios.get(apiUrl)
      setWeatherData(response.data)
      setError(null)
    } catch (error) {
      console.error('OpenWeatherMap APIからのデータの取得エラー:', error)
      setWeatherData(null)
      setError('データの取得にエラーが発生しました。もう一度試してください。')
    }
  }

  const handleDateChange = date => {
    setSelectedDate(date)
    const formattedDate = date.toISOString().split('T')[0]
    getAstronomyPicture(formattedDate)
  }

  return (
    <div>
      <h1>天気アプリ</h1>
      <DatePicker selected={selectedDate} onChange={handleDateChange} />
      <input
        type='text'
        placeholder='都市名を入力'
        value={city}
        onChange={e => setCity(e.target.value)}
      />
      <button onClick={getWeatherData}>天気を取得</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {weatherData && astronomyPicture && (
        <Weather
          weatherData={weatherData}
          astronomyPicture={astronomyPicture}
        />
      )}
    </div>
  )
}

export default App
