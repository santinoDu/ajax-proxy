import React, { useContext, useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import { Card, Row, Col, Popconfirm } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { PlusOutlined } from '@ant-design/icons';
import FilterAdd from './FilterAdd';

const Filters = (props) => {
  const {filters, onChange} = props
  const [visible, setVisible] = useState(false);

  const handleChange = (value, index) => {
    if (filters[index].editDisable) return;
    const result = [...filters]
    result[index].filter = value;
    onChange(result);
  }

  const handleDelete = (value, index) => {
    const result = [...filters];
    result.splice(index, 1);
    onChange(result);
  }

  const handleShowAddBox = () => {
    setVisible(true)
  }

  const handleAdd = (config) => {
    const {
      name,
      func,
      filter,
    } = config;
    const result = [...filters]
    result.push({
      key: uuidv4(),
      name,
      func,
      filter,
      editDisable: false,
    })
    onChange(result)
  }

  const cardStyle = {
    height: '300px',
  }

  const getDeleteHtml = (item, index) => {
    return (
      <Popconfirm title="sure to delete?" onConfirm={() => handleDelete(item, index)}>
        <a>x</a>
      </Popconfirm>
    )
  }

  return (
    <div style={{marginBottom: 20}}>
      <div className="header">Filters</div>
      <Row gutter={16}>
        {
          filters.map((item, index) => (
            <Col className="gutter-row" span={6} key={item.key}>
              <Card
                title={item.name}
                extra={item.editDisable ? '' : getDeleteHtml(item, index)}
                bodyStyle={{maxHeight: '242px', overflow: 'hidden', overflowY: 'scroll'}}
                style={cardStyle}
              >
                <Editor
                  value={item.filter}
                  onValueChange={(value) => handleChange(value, index)}
                  highlight={code => highlight(code, languages.js)}
                  padding={10}
                />
              </Card>
            </Col>
          ))
        }
        <Col className="gutter-row" span={6}>
          <Card onClick={handleShowAddBox} style={{...cardStyle, textAlign: 'center'}}>
            <a style={{fontSize: '50px', lineHeight: '250px'}}>
              <PlusOutlined />
            </a>
          </Card>
        </Col>
      </Row>
      <FilterAdd onOk={handleAdd} visible={visible} setVisible={setVisible} />
    </div>
  )
}

export default Filters;
