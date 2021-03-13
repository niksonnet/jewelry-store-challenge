import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import jsPDF from 'jspdf';
// eslint-disable-next-line
import autoTable from 'jspdf-autotable';

import Input from '../Input/Input';
import Button from '../Button/Button';
import { Fragment } from 'react';
import Header from '../Header/Header';
import { LogoutUser } from '../../../Actions/actions';
import * as storage from '../../../LocalStorage/LocalStorage';
import ModelPopup from '../../../Components/MessagePopup/MessagePopup';

class EstimateFormContainer extends Component {
  constructor(props) {
    super(props);

    const discountVal =
      this.props.user.user &&
      this.props.user.user.role &&
      this.isPrivilegedUser(this.props.user.user.role)
        ? this.props.user.user.discount['percentage']
        : 2;

    this.state = {
      estimation: {
        goldPrice: 0,
        goldWeight: 0,
        discount: discountVal,
        total: 0,
      },
      error: null,
    };

    this.handleGoldPrice = this.handleGoldPrice.bind(this);
    this.handleGoldWeight = this.handleGoldWeight.bind(this);
    this.handleDiscount = this.handleDiscount.bind(this);
    this.calculateTotal = this.calculateTotal.bind(this);
    this.isPrivilegedUser = this.isPrivilegedUser.bind(this);
    this.printToFile = this.printToFile.bind(this);
    this.handlePrintOnPaper = this.handlePrintOnPaper.bind(this);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
  }

  componentDidCatch(error) {
    this.setState((state) => ({
      ...state,
      error: error,
    }));
  }

  handleGoldPrice(e) {
    let value = e.target.value;
    this.setState(
      (prevState) => ({
        estimation: {
          ...prevState.estimation,
          goldPrice: value,
        },
      }),
      () => console.log(this.state.estimation)
    );
  }

  handleGoldWeight(e) {
    let value = e.target.value;
    this.setState(
      (prevState) => ({
        estimation: {
          ...prevState.estimation,
          goldWeight: value,
        },
      }),
      () => console.log(this.state.estimation)
    );
  }

  handleDiscount(e) {
    let value = e.target.value;
    this.setState(
      (prevState) => ({
        estimation: {
          ...prevState.estimation,
          discount: parseFloat(value).toFixed(2),
        },
      }),
      () => console.log(this.state.estimation)
    );
  }
  //Check User Role
  isPrivilegedUser(role) {
    return role && role.toLocaleLowerCase() === 'privileged';
  }
  // Calculate Rate
  calculateTotal(rate, weight, discount) {
    if (this.isPrivilegedUser(this.props.user.user.role)) {
      return parseFloat(
        discount > 0 ? rate * weight - discount / 100 : rate * weight
      ).toFixed(2);
    }

    return parseFloat(rate * weight).toFixed(2);
  }

  handleFormSubmit(e) {
    e.preventDefault();
    // calculate total
    this.setState(
      (prevState) => ({
        estimation: {
          ...prevState.estimation,
          total: this.calculateTotal(
            prevState.estimation.goldPrice,
            prevState.estimation.goldWeight,
            prevState.estimation.discount
          ),
        },
      }),
      () => console.log(this.state.estimation)
    );
  }

  printToFile() {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [5, 5],
    });
    doc.autoTable({
      head: [['Gold Rate', 'Gold Weight (grams)', 'Total Amount ( INR )']],
      body: [
        [
          this.state.estimation.goldPrice,
          this.state.estimation.goldWeight,
          this.state.estimation.total,
        ],
      ],
    });

    doc.save('Jewelry-Estimation.pdf');
  }

  handlePrintOnPaper(e) {
    e.preventDefault();
    this.setState({
      ...this.state,
      error: new Error('Method not implemented exception'),
    });
  }
  handleClearForm(e) {
    e.preventDefault();
    const discountVal = this.isPrivilegedUser(this.props.user.user.role)
      ? this.props.user.user.discount['percentage']
      : 2;

    this.setState({
      estimation: {
        goldPrice: 0,
        goldWeight: 0,
        discount: discountVal,
        total: 0,
      },
    });

    storage.deleteLocalStorage('user');
    this.props.logoutUser();
  }

  render() {
    try {
      if (
        this.props.user.loggedIn === undefined ||
        this.props.user.loggedIn === false
      ) {
        return <Redirect to='/login' />;
      }

      if (this.state.error) {
        throw new Error(this.state.error);
      }

      return (
        <Fragment>
          <Header activeUser={this.props.user.user.username}></Header>

          <form className='container-fluid' onSubmit={this.handleFormSubmit}>
            <Input
              type={'number'}
              title={'Gold Price (per gram)'}
              name={'goldPrice'}
              value={this.state.estimation.goldPrice}
              placeholder={'0.00'}
              handleChange={this.handleGoldPrice}
            />{' '}
            <Input
              type={'number'}
              title={'Weight (grams)'}
              name={'goldWeight'}
              value={this.state.estimation.goldWeight}
              placeholder={'0.00'}
              handleChange={this.handleGoldWeight}
            />{' '}
            <Input
              type={'number'}
              title={'Total Price'}
              name={'total'}
              value={this.state.estimation.total}
              placeholder={'0.00'}
              isReadOnly={true}
              // handleChange={this.handleDiscount}
            />{' '}
            {this.isPrivilegedUser(this.props.user.user.role) ? (
              <Input
                type={'number'}
                title={'Discount %'}
                name={'discount'}
                value={this.state.estimation.discount}
                placeholder={'0.00'}
                handleChange={this.handleDiscount}
              />
            ) : null}
            <Button
              action={this.handleFormSubmit}
              type={'primary'}
              title={'Calculate'}
              style={buttonStyle}
              handleChange={this.handleDiscount}
            />{' '}
            <ModelPopup
              title={'Print to Screen'}
              rate={this.state.estimation.goldPrice}
              weight={this.state.estimation.goldWeight}
              total={this.state.estimation.total}
            />
            <Button
              action={this.printToFile}
              type={'primary'}
              title={'Print to File'}
              style={buttonStyle}
            />{' '}
            <Button
              action={this.handlePrintOnPaper}
              type={'primary'}
              title={'Print to Paper'}
              style={buttonStyle}
            />{' '}
            <Button
              action={this.handleClearForm}
              type={'secondary'}
              title={'Close'}
              style={buttonStyle}
            />{' '}
          </form>
        </Fragment>
      );
    } catch (error) {
      throw new Error('Method Not Implemented exception');
    }
  }
}

const buttonStyle = {
  margin: '10px 10px 10px 10px',
};

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch) => {
  return {
    logoutUser: () => dispatch(LogoutUser()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EstimateFormContainer);
