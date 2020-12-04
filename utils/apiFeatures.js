class APIFeatures {
    constructor(query, queryString){
        this.query = query;
        this.quertString = queryString;
    }

    filter() {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        const queryObj = { ...this.queryString };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);
    // 2) Advance Filtering
        let queryStr = JSON.stringify(queryObj);
        quertStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query.find(JSON.parse(queryStr));
      return this;
    }

    sort() {
        if (this.queryString.sort){
            const sortBy = this.quertString.sort.split(',').join(' ');
            this.query= this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('0createdAt');
        }
      return this;
    }

    limitFields(){
        if (this.queryString.fields){
            const fields = this.quertString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
           } else {
               this.query = this.query.select('-__v');
           }
        return this;
    }

    pagination() {
        const page = this.quertString.page * 1 || 1;  /// Bu Default 1
        const limit = this.quertString.limit * 1 || 100;
        const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
