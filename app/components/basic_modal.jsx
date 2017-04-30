import React from 'react';
import helpers from './helpers'

export default class BasicModal extends React.Component {
	constructor(prop) {
		super(prop);
		this.props = prop
		this.closeModal = helpers.closeModal.bind(this)
	}
	render() {
		var self = this
		
	    return <div className="modal">
		  <div className="modal-dialog">
		    <div className="modal-content">
		      <div className="modal-header">
		        <button type="button" className="close" onClick={this.closeModal}>&times;</button>
		        <h4 className="modal-title">{this.props.title}</h4>
		      </div>
		      <div className="modal-body">
		      	{this.props.text}
		      </div>
		      <div className="modal-footer">
		      </div>
		    </div>
		  </div>
		</div>;
	}
}