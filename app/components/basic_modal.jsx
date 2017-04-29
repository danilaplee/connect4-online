import React 			from 'react';

export default class extends React.Component {
	constructor(props) {
		super(props);
	}
	closeModal()
	{
		this.props.modal_container.style.display = 'none';
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