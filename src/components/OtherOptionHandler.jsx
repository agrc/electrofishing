import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

function OtherOptionHandler({ show, setShow, existingOptions, otherTxt, onOtherOptionAdded }) {
  const codeTxt = useRef(null);
  useEffect(() => {
    $(modal.current).on('shown.bs.modal', () => {
      codeTxt.current.focus();
    });
  }, []);

  const modal = useRef(null);
  useEffect(() => {
    if (show) {
      $(modal.current).modal('show');
    } else {
      $(modal.current).modal('hide');
    }
  }, [show]);

  const onSubmit = () => {
    setShow(false);
    onOtherOptionAdded({ code: text });
    setText('');
  };

  const onCancel = () => {
    setText('');
    setShow(false);
  };

  const [text, setText] = useState('');
  const upper = text.toUpperCase();
  const submitDisabled = !upper || !(upper.length > 0) || existingOptions.map((v) => v.toUpperCase()).includes(upper);
  const onTextChange = (event) => {
    setText(event.target.value);
  };
  const onKeyUp = (event) => {
    if (!submitDisabled && event.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="option-option-handler">
      <div className="modal fade" ref={modal}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close" onClick={onCancel}>
                &times;
              </button>
              <h4>Add Additional Option</h4>
            </div>
            <div className="modal-body">
              <fieldset>
                <legend>Existing Options</legend>
                <ul>
                  {existingOptions
                    .filter((option) => option !== '' && option !== otherTxt)
                    .map((option) => (
                      <li key={option}>{option}</li>
                    ))}
                </ul>
              </fieldset>
              <fieldset>
                <legend>New Option</legend>
                <div className="form-group">
                  <input
                    ref={codeTxt}
                    className="form-control"
                    type="text"
                    onKeyUp={onKeyUp}
                    onChange={onTextChange}
                    tabIndex="1"
                    value={text}
                  />
                </div>
              </fieldset>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" data-dismiss="modal" onClick={onCancel} tabIndex="4">
                Cancel
              </button>
              <button className="btn btn-primary" tabIndex="3" onClick={onSubmit} disabled={submitDisabled}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

OtherOptionHandler.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  existingOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  otherTxt: PropTypes.string.isRequired,
  onOtherOptionAdded: PropTypes.func.isRequired,
};

export default OtherOptionHandler;
