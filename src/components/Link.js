const template = `
        <path :d="d" stroke="black" stroke-width="10px" @click="select(link)" :class="cl"/>
`;
const {ref,reactive,computed,inject} = Vue;
export default{
    template,
    props: ['link'],
    setup(props){
        const link = props.link;
        const newCoordinate = inject('newCoordinate');
        // computed props
        const d = computed(()=>{
            let {x:x1 , y:y1} = props.link.to.element;
            let {x:x2 , y:y2} = props.link.from.element;

            const fromNodeId = props.link.from.node.id;
            const toNodeId = props.link.to.node.id;

            x1 += (newCoordinate[fromNodeId].x / 12) + 50;
            y1 += (newCoordinate[fromNodeId].y / 12) +50;
            x2 += (newCoordinate[toNodeId].x / 12) + 50;
            y2 += (newCoordinate[toNodeId].y /12)  + 50;

            return `M ${x1} ${y1} L ${x2} ${y2}`;
        });
        const cl = computed(()=>{
            const classes = [];
            if(link.selected){
                classes.push('selected');
            }
            return classes;
        });
        const select = inject('select');
        return{
            d,
            select,
            link,
            cl,
        }
    }
}