import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Downshift from "downshift";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import keycode from "keycode";
import deburr from "lodash/deburr";
import { Router } from "../routes";
import _ from "lodash";
let _searchCriteria = null;
function renderSuggestion({
  suggestion,
  index,
  itemProps,
  highlightedIndex,
  selectedItem
}) {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || "").indexOf(suggestion.name) > -1;
  return (
    <MenuItem
      {...itemProps}
      key={suggestion.name}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestion.name}
    </MenuItem>
  );
}
renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.number,
  index: PropTypes.number,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.string,
  suggestion: PropTypes.shape({ name: PropTypes.string }).isRequired
};

class SearchComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customersList: [],
      inputValue: "",
      selectedItem: []
    };
  }

  handleKeyDown = event => {
    const { inputValue, selectedItem } = this.state;
    if (
      selectedItem.length &&
      !inputValue.length &&
      keycode(event) === "backspace"
    ) {
      this.setState({
        selectedItem: selectedItem.slice(0, selectedItem.length - 1)
      });
    }
  };

  renderInput = inputProps => {
    const { id, InputProps, classes, ref, ...other } = inputProps;
    const { selectedItem } = InputProps;
    if (_.size(selectedItem) > 0) {
      if (_.some(this.state.customersList, ["name", selectedItem[0]])) {
        _searchCriteria = _.find(this.state.customersList, [
          "name",
          selectedItem[0]
        ]);
      }
      Router.pushRoute(
        `/customer/${_searchCriteria.customerId}/${_searchCriteria.name}`
      );
    }

    return (
      <TextField
        id={id}
        InputProps={{
          inputRef: ref,
          classes: {
            root: classes.inputRoot,
            input: classes.inputInput
          },
          ...InputProps
        }}
        {...other}
      />
    );
  };
  handleInputChange = event => {
    this.setState({ inputValue: event.target.value });
  };

  handleChange = item => {
    let { selectedItem } = this.state;

    if (selectedItem.indexOf(item) === -1) {
      selectedItem = [...selectedItem, item];
    }

    this.setState({
      inputValue: "",
      selectedItem
    });
  };

  componentWillMount() {
    axios
      .get("https://api.myjson.com/bins/uc3uw")
      .then(({ data }) => {
        this.setState({ customersList: data.customerList });
      })
      .catch(error => {
        console.log("Error", error);
      });
  }

  getSuggestions(value) {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;
    return inputLength === 0
      ? []
      : this.state.customersList.filter(suggestion => {
          const keep =
            count < 5 && suggestion.name.toLowerCase().match(inputValue);

          if (keep) {
            count += 1;
          }

          return keep;
        });
  }

  render() {
    const { classes } = this.props;
    const { inputValue, selectedItem } = this.state;
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            width: "20%"
          }}
        >
          <Downshift
            id="downshift-multiple"
            inputValue={inputValue}
            onChange={this.handleChange}
            selectedItem={selectedItem}
          >
            {({
              getInputProps,
              getItemProps,
              isOpen,
              inputValue: inputValue2,
              selectedItem: selectedItem2,
              highlightedIndex
            }) => (
              <div className={classes.container}>
                {this.renderInput({
                  id: "downshift-multiple-input",
                  fullWidth: true,
                  classes,
                  InputProps: getInputProps({
                    startAdornment: selectedItem.map(item => (
                      <span>{item}</span>
                    )),
                    onChange: this.handleInputChange,
                    onKeyDown: this.handleKeyDown,
                    selectedItem: selectedItem
                  })
                })}
                {isOpen ? (
                  <Paper className={classes.paper} square>
                    {this.getSuggestions(inputValue2).map(
                      (suggestion, index) => {
                        return renderSuggestion({
                          suggestion,
                          index,
                          itemProps: getItemProps({ item: suggestion.name }),
                          highlightedIndex,
                          selectedItem: selectedItem2
                        });
                      }
                    )}
                  </Paper>
                ) : null}
              </div>
            )}
          </Downshift>
        </div>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 250
  },
  container: {
    flexGrow: 1,
    position: "relative"
  },
  paper: {
    position: "absolute",
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`
  },
  inputRoot: {
    flexWrap: "wrap"
  },
  inputInput: {
    width: "auto",
    flexGrow: 1
  },
  divider: {
    height: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(SearchComponent);
