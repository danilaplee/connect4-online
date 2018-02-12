import React from 'react';
import helpers from './helpers'

export default class MapModal extends React.Component {
	constructor(prop) {
		super(prop);
		this.props 		= prop
		this.closeModal = helpers.closeModal.bind(this)
		this.resolve 	= prop.promise;
	}
	render() {
		const closeM = () => this.closeModal()
		const selectMap = map => { 
			this.resolve(map)
			this.closeModal()
		}

	    return (<div className="modal">
		  <div className="modal-dialog">
		    <div className="modal-content">
		      <div className="modal-header">
		        <button type="button" className="close" onClick={closeM}>&times;</button>
		        <h3 className="modal-title" style={{color:"#FFA07A"}}>{this.props.title}</h3>
		      </div>
		      <div className="modal-body" style={{height:"300px"}}>
		      	<div className="col-xs-4 map-item classic" onClick={selectMap.bind(this, "classic")}>
		      		<div style={{width:"140px",height:"80px",background:"#FFA07A"}}></div>
		      		<h3 style={{color:"#FFA07A"}}>classic</h3>
		      	</div>
		      	<div className="col-xs-4 map-item tower" onClick={selectMap.bind(this, "tower")}>
		      		<div style={{width:"100px",height:"200px",background:"rgb(121, 210, 132)"}}></div>
		      		<h3 style={{color:"rgb(121, 210, 132)"}}>tower</h3>
		      	</div>
		      	<div className="col-xs-4 map-item cog" onClick={selectMap.bind(this, "cog")}>
		      		<div style={{width:"100px",height:"100px",background:"rgb(124, 121, 210)"}}></div>
		      		<h3 style={{color:"rgb(124, 121, 210)"}}>cog</h3>
		      	</div>
		      </div>
		      <div className="modal-footer">
		      </div>
		    </div>
		  </div>
		</div>);
	}
}