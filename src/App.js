import React, { useContext, useState, useEffect, useRef } from 'react';
import { Switch, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import 'antd/dist/antd.css';
import ProxyTable from './ProxyTable';
import Filters from './Filters';
import FetchedList from './FetchedList';
// import json2xml from './json2xml';

// const json2xmlKey = '0'
const debugActiveName = 'proxy-debug-status'

function App() {
  const [filters, setFilters] = useState([
    // {
    //   key: json2xmlKey,
    //   name: 'json2xml',
    //   editDisable: true,
    //   filter: json2xml.toString(),
    // },
    {
      key: '1',
      name: 'example',
      editDisable: false,
      filter: `function format(json) {
        json.version = '1.0.0';
        return json;
      }`
    }
  ]);
  const [list, setList] = useState([]);
  const [proxyStatus, setProxyStatue] = useState(false);
  const [fetchedList, setFetchedList] = useState([]);
  const setAndStoreList = (list) => {
    setList(list)
    chrome.storage.local.set({'proxyTable': list}, function() {
      console.log('proxyTable saved');
    });
  }

  useEffect(() => {
    chrome.storage.local.get(['proxyTable', 'proxyFilters'], function(items) {
      if (items.proxyTable) {
        setList(items.proxyTable)
      }
      if (items.proxyFilters) {
        setFilters(items.proxyFilters)
      }
    });

    window.addEventListener('message', (event) => {
      let message = event.data;
      if (message) {
        const source = message.source;
        const action = message.action;
        if (source === 'fetch-xhr') {
          setFetchedList(current => [{...action, key: uuidv4()}, ...current].slice(0, 100));
        }
        if (source === debugActiveName) {
          return setProxyStatue(action);
        }
        if (source === 'proxy-match-multiple') {
          const {filteredData, request} = action;
          return Modal.error({
            title: 'find multiple results, please modify before proxy',
            content: `${request.url} finds ${filteredData.map(item => item.url).join(',  ')} results`,
            onOk() {},
          });
        }
      }
      
    })
  }, []);

  const filtersCall = (filtersKey = [], content) => {
    try {
      const json = JSON.parse(content)
      return filtersKey
        .map(key => filters.find(item => item.key === key).filter)
        .reduce((result, filter) => {
          const wrap = () => "{ return " + filter + " };"
          const func = new Function( wrap(filter) )
          const a = func.call(null).call(null, result)
          return a
        }, json)
    } catch(e) {
      console.log('e', e)
    }
    return ''
  }

  const formator = (filtersSelect, content) => {
    const temp = filtersCall(filtersSelect, content)
    const contentString = typeof temp === 'object' ? JSON.stringify(temp) : temp
    return contentString
  }

  const handleList = (list) => {
    list.forEach(item => {
      if (item.filtersSelect && item.filtersSelect.length) {
        item.formatContent = formator(item.filtersSelect, item.content)
      } else {
        item.formatContent = item.content;
      }
    });
    setAndStoreList(list)
  }

  const handleFilters = (filters) => {
    setFilters(filters)
    chrome.storage.local.set({'proxyFilters': filters}, function() {
      console.log('proxyFilters saved');
    });
  }

  const handleProxy = (checked) => {
    setProxyStatue(checked);
    window.postMessage({
      action: checked,
      source: debugActiveName,
    }, '*');
  }

  const handleFetchedSelected = (type, updateItem) => {
    // updateItem：add时位items，delete时为keys
    if (type === 'add') {
      setAndStoreList([...list, ...updateItem])
    } else {
      const result = list.filter(item => !updateItem.includes(item.key));
      setAndStoreList(result);
    }
  }

  const handleClearTable = () => {
    setFetchedList([])
  }

  return (
    <div className="App">
      <div>Proxy Status:<Switch checkedChildren="on" unCheckedChildren="off" checked={proxyStatus} onChange={handleProxy} /></div>
      <ProxyTable filters={filters} list={list} setList={handleList} />
      <Filters filters={filters} onChange={handleFilters} />
      <FetchedList list={fetchedList} onChange={handleFetchedSelected} handleClearTable={handleClearTable} />
    </div>
  );
}

export default App;
