import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popover, Switch, Select } from 'antd';
import ReactJson from 'react-json-view';
import XMLViewer from 'react-xml-viewer'
import { v4 as uuidv4 } from 'uuid';
import { EyeOutlined } from '@ant-design/icons';
import './index.css';
const { Option } = Select;
 
const ProxyTable = (props) => {
  const {
    list,
    setList,
    filters,
  } = props;

  const updateList = (key, updateKey, updateValue) => {
    const result = [...list]
    const filter = list.find(item => item.key === key)
    filter[updateKey] = updateValue
    setList(result)
  }

  const handleDelete = (key) => {
    setList(list.filter((item) => item.key !== key))
  };

  const handleAdd = () => {
    const newData = {
      key: uuidv4(),
      content: `{"a": {"b": 2}}`,
      filtersSelect: [],
      active: true,
    };
    setList([...list, newData]);
  };

  const preview = (text) => {
    let result = ''
    let content = text || ''
    const firstLetter = content[0]
    if (!'<{'.includes(firstLetter)) {
      return result;
    }
    const eyeStyle = { marginLeft: 10 }
    try {
      const isXml = firstLetter === '<'
      const eyeIcon = <EyeOutlined style={eyeStyle} />
      if (isXml) {
        const src = <XMLViewer xml={content} />
        return (
          <Popover content={src} title="xml preview" trigger="click">
            {eyeIcon}
          </Popover>
        )
      } else {
        const src = JSON.parse(content);
        return (
          <Popover content={<ReactJson src={src} />} title="json preview" trigger="click">
            {eyeIcon}
          </Popover>
        )
      }
    } catch (e) {
      console.log('eee', e)
    }
    return result
  }

  const columns = [
    {
      title: 'URL(or postData) includes string',
      dataIndex: 'url',
      render: (_, record) => (
        <Input value={record.url} onChange={(e) => updateList(record.key, 'url', e.target.value )} />
      ),
    },
    {
      title: 'replace content',
      dataIndex: 'content',
      width: '30%',
      render: (_, record) => 
        <>
          <Input
            value={record.content}
            onChange={(e) => updateList(record.key, 'content', e.target.value )}
            className="eye-input"
          />
          {preview(record.content)}
        </>,
    },
    {
      title: 'formators (multiple, sequential execution)',
      render: (_, record) => (
        <>
          <Select
            defaultValue={record.filtersSelect}
            mode="multiple"
            onChange={(value) => updateList(record.key, 'filtersSelect', value)} 
            className="eye-input"
          >
            {
              filters.map(filter => <Option key={filter.key}>{filter.name}</Option>)
            }
          </Select>
          {preview(record.formatContent)}
        </>
      )
    },
    {
      title: 'open status',
      dataIndex: 'active',
      render: (_, record) =>
        <Switch checked={record.active} onChange={(checked) => updateList(record.key, 'active', checked)} />,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) =>
        <a onClick={() => handleDelete(record.key)}>delete</a>,
    },
  ];

  return (
    <div className="proxy-table">
      <div style={{textAlign: 'right'}}>
        <Button
          onClick={handleAdd}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          add new rule
        </Button>
      </div>
      <Table
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={list}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}

export default ProxyTable
