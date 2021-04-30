import React, { useState } from 'react';
import { Table, Button } from 'antd';
import './index.css';
 
const FetchedList = (props) => {
  const { list, onChange, handleClearTable } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    {
      title: 'url',
      dataIndex: 'url',
      width: '40%',
    },
    {
      title: 'response',
      dataIndex: 'content',
      render: (_, record) => {
        const content = record.content || '';
        return content.length > 2000 ? `${content.slice(0, 2000)}...` : content
      },
    },
  ];
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      const addKeys = selectedKeys.filter(key => !selectedRowKeys.includes(key))
      const deleteKeys = selectedRowKeys.filter(key => !selectedKeys.includes(key))
      const type = addKeys.length ? 'add' : 'delete';
      const updateKeys = type === 'add' ? addKeys : deleteKeys;
      const updateRows = selectedRows.filter(row => updateKeys.includes(row.key));
      onChange(type, type === 'add' ? updateRows : deleteKeys)
      setSelectedRowKeys(selectedKeys)
    },
  };

  return (
    <div className="proxy-table">
      <div className="header" style={{textAlign: 'right'}}>
        <span style={{float: 'left'}}>fetched xhr</span>
        <Button
          onClick={handleClearTable}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          remove list
        </Button>
      </div>
      <Table
        className="fetched-list"
        bordered
        dataSource={list}
        columns={columns}
        pagination={false}
        rowSelection={rowSelection}
      />
    </div>
  );
}

export default FetchedList
