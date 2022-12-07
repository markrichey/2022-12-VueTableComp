Vue.component("comp-table",{
    template: `
        <div class="css_comp_table">
            <table class="striped">
                <thead>
                    <tr>
                        <th v-for="h in headings" @click="fnFilterColumnChoices(h);">
                            <span>{{h}}</span>
                        </th>
                    </tr>
                    <tr v-if="filtering">
                        <td v-for="h in headings" @click="fnFilterColumnChoices(fnGetHeadingColumn(h));">
                            
                            <select multiple v-if="fnInFilterFromList(fnGetHeadingColumn(h))" v-model.lazy="filterChoiceOptions[fnGetHeadingColumn(h)]" @change="fnApplyFilterChoice()">
                                <option v-for="o in fnFilterColumnChoices(fnGetHeadingColumn(h))" v-bind:value="o">{{o}}</option>
                            </select>

                            <input type='text' v-if="fnInFilterFromList(fnGetHeadingColumn(h)) == false" v-model.lazy="filterChoiceOptions[fnGetHeadingColumn(h)][0]" @change="fnApplyFilterChoice()" />

                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="con in content" v-if="fnInFilterRows(con.FilterIndex)">
                        <td v-for="col in columns">{{con[col]}}</td>
                        <td v-for="b in buttons" class="css_comp_table_button" @click="fnButton(con[b.Value],b.Action)"><span><b>{{b.Label}}</b></span></td>
                    </tr>
                </tbody>
            </table>
            <p>{{fnRowCount()}} Row(s) <span v-if="filterIndexList.length > 0" @click="fnClearFilter()"><b><u>Clear Filters</u></b></span></p>
        </div>
    `,
    props:{
        headings: Array,
        columns: Array,
        content: Array,
        filterfromlist: Array,
        filtering: Boolean,
        buttons: Array
    },
    methods:{
        fnButton: function(value,action){
            console.log(value);
            console.log(action);
        },
        fnGetHeadingColumn: function(head){
            return this.columns[this.headings.indexOf(head)];
        },
        fnRowCount: function(){
            if(this.filterIndexList.length == 1 && this.filterIndexList[0] < 0){
                return 0;
            }else{
                if(this.filterIndexList.length > 0){
                    return this.filterIndexList.length;
                }else{
                    return this.content.length;
                }
            }
        },
        fnClearFilter: function(){
            this.filterIndexList = [];
            for(let i = 0; i < Object.keys(this.filterChoiceOptions).length; i++){
                this.filterChoiceOptions[Object.keys(this.filterChoiceOptions)[i]] = [];
            }
            return;
        },
        fnInFilterRows: function(FilterIndex){
            if(this.filterIndexList.length == 0){
                return true;
            }
            else{
                return this.filterIndexList.indexOf(FilterIndex) > -1;
            }
        },
        fnInFilterFromList: function(col){
            return this.filterfromlist.indexOf(col) >= 0;
        },
        fnFilterColumnChoices: function(col){       
            let columnFilterChoices = [];  
            for(let i = 0; i < this.content.length; i++){
                if(columnFilterChoices.indexOf(this.content[i][col]) < 0){
                    columnFilterChoices.push(this.content[i][col]);
                }
                columnFilterChoices.sort();
            }
            return columnFilterChoices;
        },
        fnApplyFilterChoice: function(){
            let first = true;
            let validOptions = [];  
            let previousOptions = [];    
            for(let i = 0; i < Object.keys(this.filterChoiceOptions).length; i++){
                let values = this.filterChoiceOptions[Object.keys(this.filterChoiceOptions)[i]];
                if(values.length > 0){ // Do we have anything to check?
                    validOptions = []; // Reset Each Time
                    
                    if(first){
                        // The Initial Run Through
                        for(let d = 0; d < this.content.length; d++){
                            if(this.fnInFilterFromList(Object.keys(this.filterChoiceOptions)[i]) && values.indexOf(this.content[d][Object.keys(this.filterChoiceOptions)[i]]) > -1){
                                validOptions.push(this.content[d].FilterIndex);
                            }else{
                                if(String(this.content[d][Object.keys(this.filterChoiceOptions)[i]]).includes(values[0])){
                                    validOptions.push(this.content[d].FilterIndex);
                                }
                            }
                        }
                    }else{
                        // Checking against previous
                        for(let d = 0; d < this.content.length; d++){
                            if(previousOptions.indexOf(this.content[d].FilterIndex) > -1 && this.fnInFilterFromList(Object.keys(this.filterChoiceOptions)[i]) && values.indexOf(this.content[d][Object.keys(this.filterChoiceOptions)[i]]) > -1){
                                validOptions.push(this.content[d].FilterIndex);
                            }else{
                                if(previousOptions.indexOf(this.content[d].FilterIndex) > -1 && String(this.content[d][Object.keys(this.filterChoiceOptions)[i]]).includes(values[0])){
                                    validOptions.push(this.content[d].FilterIndex);
                                }
                            }
                        }
                    }
                    if(first){
                        first = false;
                    }
                    previousOptions = [...validOptions]
                }
            }

            /* Update the List */
            this.filterIndexList = validOptions;
            if(this.filterIndexList.length == 0){
                this.filterIndexList.push(-1);
            }
            return;
        }
    },
    data: function(){
        return {
            filterChoiceOptions: {},
            filterIndexList: []
        }
    },
    calculate:{},
    created: function(){

        // Index All Data
        this.content.map((o,index) =>{
            o.FilterIndex = index;
        });

        // Create Filter Choice Options
        for(let i = 0; i < this.columns.length; i++){
            this.filterChoiceOptions[this.columns[i]] = [];
        }

        // Enable Selects
        Vue.nextTick(()=>{
            let options = {};
            elms = document.querySelectorAll("select");
            instances = M.FormSelect.init(elms,options);
            M.AutoInit();
        });

        return;
    }
});