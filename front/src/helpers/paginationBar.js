import React from 'react';
import './paginationBar.css';
import { i18n } from '../i18n/i18n';

class PaginationBar extends React.Component {
  nbIndices = 10;

  state = {
    startIndex: null,
  };
  render() {
    const { pageIndex, onClick, totalCount, limit } = this.props;

    const nbPages = Math.ceil(totalCount / limit);
    const currentIndex = pageIndex <= nbPages ? pageIndex : nbPages;
    const defaultStartIndex = Math.trunc((currentIndex - 1) / this.nbIndices) * this.nbIndices + 1;

    const startIndex = this.state.startIndex || defaultStartIndex;

    const showPreviousArrow = startIndex > 1;
    const showNextArrow = startIndex + 10 < nbPages;

    const displayedPageLinks = [];
    for (let i = 0; i < this.nbIndices && startIndex + i <= nbPages; i++) {
      displayedPageLinks.push(startIndex + i);
    }
    return (
      <div className="paginationBar">
        <div className="paginationArrow">
          {showPreviousArrow && (
            <div
              onClick={() => {
                this.setState({ startIndex: startIndex - this.nbIndices });
              }}
            >
              &lt;
            </div>
          )}
        </div>
        {displayedPageLinks.map((p) => {
          if (pageIndex === p) {
            return (
              <div key={p} className="pageIndex current">
                {p}
              </div>
            );
          }
          return (
            <div key={p} className="pageIndex" onClick={() => onClick(p)}>
              {p}
            </div>
          );
        })}
        <div className="paginationArrow">
          {showNextArrow && (
            <div
              onClick={() => {
                this.setState({ startIndex: startIndex + this.nbIndices });
              }}
            >
              &gt;
            </div>
          )}
        </div>
        <div>{`/ ${nbPages} ${i18n.t('pagination_pages')}`}</div>
      </div>
    );
  }
}

export { PaginationBar };
