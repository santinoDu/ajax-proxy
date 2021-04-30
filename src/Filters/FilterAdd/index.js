import React, { useContext, useState, useEffect, useRef } from 'react';

import { Row, Col, Modal, Input, Form } from 'antd';

const FilterAdd = (props) => {
  const {
    onOk,
    visible,
    setVisible,
  } = props;
  const [name, setName] = useState('');
  const [filter, setFilter] = useState('');
  const filterPlaceholder = `function format(json) {
    json.version = {a: '1.0.0'};
    return json;
  }`

  const handleOk = () => {
    if (!name || !filter) return;
    onOk({name, filter});
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  
  return (
    <Modal
      title="add new filter"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Row style={{marginBottom: 20}}>
        <Col span={6}>title</Col>
        <Col span={18}>
          <Input value={name} onChange={(e) => {setName(e.target.value)}} />
        </Col>
      </Row>
      <Row style={{marginBottom: 20}}>
        <Col span={6}>filter</Col>
        <Col span={18}>
          <Input.TextArea
            value={filter}
            onChange={(e) => {setFilter(e.target.value)}} rows={10}
            placeholder={filterPlaceholder}
          />
        </Col>
      </Row>
    </Modal>
  )
}

export default FilterAdd
