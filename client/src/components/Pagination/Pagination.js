import React, { Component } from "react"; 
import ReactPagination from "react-js-pagination"; 

class Pagination extends Component {

    constructor(props) {
        super(props);
		this.state = this.generateState(props)
    }
    generateState = (props) => {
		return { 
            activePage: props.activePage || 0,
            totalItemsCount: props.totalItemsCount || 0,
            pageRangeDisplayed: props.pageRangeDisplayed || 0,
            handlePageClick: props.handlePageClick,
        };
    }
    handlePageClick = e => {
        if(this.state.handlePageClick){
            this.state.handlePageClick(e)
        }
    };
    shouldComponentUpdate(nextProps, nextState) {
        const change = this.state.activePage !== nextProps.activePage ||
                this.state.totalItemsCount !== nextProps.totalItemsCount ||
                this.state.pageRangeDisplayed !== nextProps.pageRangeDisplayed ||
                this.state.handlePageClick !== nextProps.handlePageClick;
        if(change){
            this.setState(this.generateState(nextProps));
        }
        if(this.state !== nextState)
           return true
        return change;
    }

    render() {
        return (
            <div className="paginationContainer">
                <ReactPagination
                    prevPageText={'Back'}
                    nextPageText={'Next'}
                    firstPageText={'First'}
                    lastPageText={'Last'}
                    activePage={this.state.activePage}
                    totalItemsCount={this.state.totalItemsCount}
                    marginPagesDisplayed={0}
                    pageRangeDisplayed={this.state.pageRangeDisplayed}
                    onChange={this.handlePageClick}
                    innerClass={'pagination'}
                    activeClass={'active'}
                    />
            </div>
        );
    }
}
 
export default Pagination;