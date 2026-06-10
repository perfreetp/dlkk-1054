import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useStore } from '@/store';
import './app.scss';

function App(props) {
  useEffect(() => {
    useStore.getState().loadFromStorage();
  }, []);

  useDidShow(() => {
    useStore.getState().loadFromStorage();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
