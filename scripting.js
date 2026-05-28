function f_adder(skill_name, affects_components="", affects_multipliers="", mastery_amount="") {

    let rawData = JSON.parse(localStorage.getItem(skill_name));
 
    let data = {
        current_point_gained:0,
        potential:0,
        mastery_level:'',
    	point_initial:60/mastery_amount,
        point:0,
        affects: {
            component:affects_components,
            multipliers:affects_multipliers
        }
    };

    if (rawData) {
        if (mastery_amount !== "") {
            rawData['point_initial'] = 60 / mastery_amount;
        }

        if (affects_components != {}) {

            console.log(affects_components, 'k');
            console.log(rawData['affects']['component'], 'o');
            Object.assign(rawData['affects']['component'],affects_components)
            
        }

        if (affects_multipliers != {}) {
            console.log(affects_multipliers, 'o');
            console.log(rawData['affects']['multipler'], 'o');
            Object.assign(rawData['affects']['multipliers'], affects_multipliers)
        }
        localStorage.setItem(skill_name, JSON.stringify(rawData));
    }
    else {
        localStorage.setItem(skill_name, JSON.stringify(data));
    }


    console.log(skill_name, affects_components, affects_multipliers, mastery_amount)
    console.log(data, rawData);

    
}




function removee(skill_name, element = "") {
    if (element == "") {
        localStorage.removeItem(skill_name);
    }
    else {
        let rawdata = JSON.parse(localStorage.getItem(skill_name));
        delete rawdata['affects'][element[0]][element[1]]
        localStorage.setItem(skill_name, JSON.stringify(rawdata));
    }
}

function input(skill_name,{effort=1,time=60,reps=0})
{
    let data = JSON.parse(localStorage.getItem(skill_name));
    let initial_point = data['point_initial'];
    let rate_time = time/60
    
    let current_point = (reps === 0) ? rate_time*initial_point*effort : rate_time*initial_point*effort*reps;
    
    //console.log(current_point,'current_pointtttttttttttttt')
    data['current_point_gained'] = current_point

    //console.log(data['current_point_gained'],'current_point_gained')
    data['point']+= data['current_point_gained'];
    localStorage.setItem(skill_name,JSON.stringify(data));


    //console.log(current_point)
}



function datafrom_localstorage(){
    let mock = {}
    
    for (var i = 0; i < Object.keys(localStorage).length; i++) {
        let name = Object.entries(localStorage)[i][0];
        let attr = JSON.parse(Object.entries(localStorage)[i][1]);
        mock[name] = attr;
        //console
    }
    return mock

}



function saveto_localstorage(modified_data){
    for (var i = 0; i < Object.keys(modified_data).length; i++) {
        let name = Object.entries(modified_data)[i][0];
        let attr = (Object.entries(modified_data)[i][1]);
        localStorage.setItem(name, JSON.stringify(attr));
    }
    
}


function calculate_potential(skill_name){
    let sd = {}
    let v_mock = datafrom_localstorage()
    // 1 - 6
    for (let n=1;n<=6;n++){
        let nm = []
        let lists_toremove=[]
        for (let i=1;i<=60;i++){
            input(skill_name,{time:60*n});
            let f_list = BSA(skill_name);
            lists_toremove.push(f_list);
            mock = datafrom_localstorage()
            let num = Math.round(mock[skill_name]['point'])

            nm.push([mock[skill_name]['point'],i,n])
            
        }

        sd[n] = nm
        let flatend = lists_toremove.flat(Infinity);

        for (let item of flatend){
            rr(item);
        }
    }

    v_mock[skill_name]['potential'] = sd
    saveto_localstorage(v_mock);
}




function rewarding_state(skill_name){
    mock = datafrom_localstorage();

    const levelNames = {
        0:  "Complete Beginner",
        5:  "Apprentice",
        10: "Practitioner",
        15: "Competent",
        20: "Proficient",
        25: "Advanced",
        30: "Elite",
        35: "Expert",
        40: "Specialist",
        45: "Veteran",
        50: "Superior",
        55: "Grandmaster",
        60: "Genius",
        65: "Transcendent"
    };

    let currentPoint = Math.trunc(mock[skill_name]['point']);
    //console.log(currentPoint,'p')
    // Check if the current point is a milestone and exists in our map


    let y =[]
    for (let i=0;i<=65;i++){
        if (i %5 ==0){
            if (i <= currentPoint){
                y.push(i)
            }
        }
    }

    mock[skill_name]['mastery_level']= levelNames[y[y.length-1]]
    
    saveto_localstorage(mock)
}

function BSA(start_node) {
   
    let mock = datafrom_localstorage()

    let looked = new Set([start_node]);
    let fathers = [start_node];

    // Safely iterate only as long as there are discovered nodes
    for (let nodes = 0; nodes < fathers.length; nodes++) {
        let father = fathers[nodes];
        let affects = mock[father]?.affects || {};

        // If it's an Array, use it directly. If it's an Object, get the keys.
        let comp_raw = affects.component || {};
        let compis = Array.isArray(comp_raw) ? comp_raw : Object.keys(comp_raw);

        let multi_raw = affects.multipliers || {};
        let multis = Array.isArray(multi_raw) ? multi_raw : Object.keys(multi_raw);

        let al_affects = [...compis, ...multis];

        //console.log(father,affects)
        for (let i = 0; i < al_affects.length; i++) {
            let child = al_affects[i]; // Added 'let' to prevent global leak

            let check_type = ((n) => {
                let compa = compis.includes(n)
                let multa = multis.includes(n)
                if (compa){
                    return 'component'
                }else if (multa){
                    return 'multipliers'
                }else{
                    return 'notfound'
                }                
            })
            
            // Safety check: ensure the node actually exists in the mock object
            if (!mock[child]) continue; 


            if (looked.has(child)){

                if (check_type(child) == 'multipliers'){
                    let component_type= check_type(child);
                    let father_point = mock[father]['point']
                    let child_point = mock[child]['point']
                    let initial_fatherpoint = mock[father]['point_initial']
                    let initial_childpoint = mock[child]['point_initial']
                    let bon = (mock[father]['point']*0.002)
                    
                    mock[child]['point'] += bon
                    // console.log(bon,'bon')
                    // console.log(`seen-- ${child}'s point is ${mock[child]['point']}, ${father} point is ${mock[father]['point']}, ${child} percentage ${affects[component_type][child]} assigned by ${father}`)
                }

            } else {
                fathers.push(child);
                looked.add(child);                
                let component_type= check_type(child);

                let father_point = mock[father]['point']
                let father_gained_point = mock[father]['current_point_gained'];
                let child_point = mock[child]['point']
                let initial_fatherpoint = mock[father]['point_initial']
                let initial_childpoint = mock[child]['point_initial']

                let child_percentage = (affects[component_type][child])/100

                // Ensure we never divide by zero
                let trans_perc = (father_gained_point / initial_fatherpoint);
                //console.log(trans_perc,'trans_perc')
                let convert_to_childrate = (trans_perc*initial_childpoint)*child_percentage
                //console.log(convert_to_childrate,'convert_to_childrate')
                
                mock[child]['point'] += convert_to_childrate;
                //console.log(component_type,child,father)
                rewarding_state(child);
                //console.log(`child=${child},father=${father}, ${child}'s point is ${child_point}, ${father}'s point is ${mock[father]['point']}, ${child} percentage is ${child_percentage} assigned by ${father}`)

            }
        }
    }

    
    saveto_localstorage(mock);
    return fathers
}


function rr(mk,num){
    let data = JSON.parse(localStorage.getItem(mk));
    data['point']=num
    data['current_point_gained']=num
    // console.log(data)
    localStorage.setItem(mk,JSON.stringify(data))
}



function c_adder(habit){
    let n = new Date()
    
    let data = {
        timestampss:{},
        reminder:0,
        total:0
    };
    //console.log(data)
    localStorage.setItem(habit, JSON.stringify(data));
}


function c_update(habit,completed){
    let mock = datafrom_localstorage();
    const nw = new Date().toISOString()

    mock[habit]['timestampss'][nw] =  completed
    mock[habit]['total']+= completed
    console.log(mock);
    localStorage.setItem(habit, JSON.stringify(mock[habit]));
}

function goal_adder(goal_name,number){
    let mock = datafrom_localstorage();
    let rwdata = JSON.parse(localStorage.getItem(goal_name));
    let total = 0

    console.log(number,number[0],number[1])
    if (mock[number[0]]){
        total += (number[1])
    }

    if (rwdata) {
        rwdata['total_']+= total;
        for (let j of rwdata['goal_requirment']){
            console.log(j[0],number[0])
            if (j[0] == number[0]){
                return 0;
            }
        }

        rwdata['goal_requirment'].push([number[0],number[1]]);
        localStorage.setItem(goal_name, JSON.stringify(rwdata));
    }
    else{
        let data = {
            goal_requirment:[number],
            total_:total,
            current_progress:0
        }

        localStorage.setItem(goal_name, JSON.stringify(data));
    }
    //console.log(goal_name,number)
}


function removee_(skill_name, element = "") {
    if (element === "") {
        localStorage.removeItem(skill_name);
        return;
    }

    let data = JSON.parse(localStorage.getItem(skill_name));

    if (data && data['goal_requirment']) {
        data['goal_requirment'] = data['goal_requirment'].filter(item => item[0] !== element[0]);

        let datas = datafrom_localstorage();

        for (a in datas){
            if (a == element[0]){
                data["total_"]-=element[1];
            }
        }
        localStorage.setItem(skill_name, JSON.stringify(data));
        console.log("Updated Data:", data);
    }
}


function update_goals(){
    let datas = datafrom_localstorage();
    let ov = 0
    for (let names in datas){
        if (datas[names]['goal_requirment']){
            let li = (datas[names]['goal_requirment']);
            for (let list_items of li){
                //console.log(names,list_items[0])
                let fgo = Object.keys(datafrom_localstorage())
                if (fgo.includes(list_items[0])){
                    ov += list_items[1]
                }
            }
            datas[names]['total_'] = ov
        }
    }

    saveto_localstorage(datas);
}

function goal_checker(){
    let mock = datafrom_localstorage()
    let goals = []
    let goal_requirment_items= []
    for (let t in mock){
        if (mock[t]['goal_requirment']){
           goals.push(t)
        }
    }
    let calculated_total=0

    for (let goal of goals){
        let items = mock[goal]['goal_requirment']

        let total_calculation = 0
        for (let item of items){
            if (mock[item[0]]){
                console.log(mock[item[0]])
                if (mock[item[0]]['timestampss']){
                    console.log(goal,item[0],mock[item[0]]['total'],item[1])
                    if (mock[item[0]]['total'] >= item[1]){
                        total_calculation+=item[1]
                    }else{
                        total_calculation+=mock[item[0]]['total']
                    }
                }
                if (mock[item[0]]['point_initial']){
                    console.log(goal,item[0],mock[item[0]]['point'],item[1])
                    if (mock[item[0]]['point'] >= item[1]){
                        total_calculation+=item[1]
                    }else{
                        total_calculation+=mock[item[0]]['point']
                    }
                }

            }        
        }
        mock[goal]['current_progress'] = {
            'calculation':total_calculation,
            'percentage':((total_calculation/mock[goal]['total_'])*100)
        }
    }
    saveto_localstorage(mock);

}

function future_potential(skillname, t){
    let dat = datafrom_localstorage();
    const df = {};
    for (let y in dat){
        df[y]=(dat[y]['point'])
    }

    rr(skillname,0)
    let ov=[]
    for (let i=1;i<=6;i++){
        input(skillname,{effort:i,time:60*t});
        BSA(skillname);
        rewarding_state(skillname)
        let datas = datafrom_localstorage()
        const temo = datas[skillname]['point']
        
        ov.push([i,temo,datas[skillname]['mastery_level']])
        rr(skillname,0)
    }
    for (let n in df){
        rr(n,df[n])
        rewarding_state(n)
    }
    return ov

}

const supabaseUrl = 'https://mrtjnfdnesxcspxrvumt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydGpuZmRuZXN4Y3NweHJ2dW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzE0NzQsImV4cCI6MjA5NTMwNzQ3NH0.eNugYMocBHbuYhhvi7pU-7HSfyNTxuuy22EHSmLfnRw';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function GetData() {
    const { data, error } = await supabaseClient
        .from('holistic_db')
        .select('*'); // Explicitly select all columns

    if (error) {
        console.error('Error found:', error.message);
        return;
    }

    if (data.length === 0) {
        console.log('Connected! But table "todo" returned 0 rows. Fix this in your Supabase dashboard.');
    } else {
        console.log('Data found:', data, data[data.length-1]);
        return data[data.length-1]['all_data']
    }
}

async function writeData() {
    // .insert() accepts an object (or an array of objects for multiple rows)
    // Replace 'task' and 'is_completed' with your actual column names
    const { data, error } = await supabaseClient
        .from('holistic_db')
        .insert([
            { all_data: datafrom_localstorage()}
        ])
        .select(); // .select() forces Supabase to return the newly created row

    if (error) {
        console.error('Error inserting data:', error.message);
        return;
    }

    console.log('Data successfully written:', data);
}
async function firstimer(dat) {
    // .insert() accepts an object (or an array of objects for multiple rows)
    // Replace 'task' and 'is_completed' with your actual column names
    let daty = await GetData()
    saveto_localstorage(daty)

    const { data, error } = await supabaseClient
        .from('user_data')
        .insert([
            { DT: dat}
        ])
        .select(); // .select() forces Supabase to return the newly created row

    if (error) {
        console.error('Error inserting data:', error.message);
        return;
    }

    console.log('Data successfully written:', data);
}