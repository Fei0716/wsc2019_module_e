const {createApp,ref,reactive, watchEffect,watch,provide} = Vue;

import ViewMode from './views/ViewMode.js';
import EditMode from './views/EditMode.js';

const app = createApp({
    // global components
    components: {
        'view-mode': ViewMode,
        'edit-mode': EditMode,
    },
    setup(){
        //specify the initial mode
        const mode = ref('edit');
        const elements = reactive([]);
        const links = reactive([]);

        // the correlation of one element to the next element based on node id
        const correlation = {
            1: 3,
            2: 4,
            3: 1,
            4: 2,
        }
        // when creating new element refer to the current clicked node to get new coordinate
        const newCoordinate = {
            1: {
                x: 0 , y: -250,
            },
            2: {
                x: 250 , y: 0,
            },
            3: {
                x:0  , y: 250,
            },
            4: {
                x: -250 , y: 0,
            },
        }
        // if there are elements exist
        if(localStorage.getItem('elements')){
            Object.assign(elements, JSON.parse(localStorage.getItem('elements')));
            // need to assign the elements and nodes of a link based on the element, or else reactivity wont work
            Object.assign(links, JSON.parse(localStorage.getItem('links')).map(link => {
                const fromEl = elements.find(x => x.id === link.from.element.id);
                const toEl = elements.find(x => x.id === link.to.element.id);
                return Object.assign({}, link, {
                    from: {
                        element:fromEl,
                        node:fromEl.nodes.find(x => x.id === link.from.node.id)
                    },
                    to: {
                        element:toEl,
                        node:toEl.nodes.find(x => x.id === link.to.node.id)
                    },
                });
            }));
        }else{
            createElement({id: 'root'});
        }
        // set up watcher
        watchEffect(() =>{
            // whenever there's changes to elements and links will save the changes to local storages
            localStorage.setItem('elements', JSON.stringify(elements));
            localStorage.setItem('links', JSON.stringify(links));
        });

        function createElement(option){
            let element = {
                id: Date.now(),
                nodes: [
                    {id: 1 , caption: '', linkId: null},
                    {id: 2 , caption: '', linkId: null},
                    {id: 3 , caption: '', linkId: null},
                    {id: 4 , caption: '', linkId: null},
                ],
                x: window.innerWidth / 2,//by default put at center
                y: window.innerHeight / 2,
                title: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus, laudantium!',
                content: `
                <img class="d-block mx-auto" src="src/assets/kazan_final_s_3.jpg"> <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas perspiciatis quia consectetur explicabo doloremque qui perferendis enim, provident neque. Voluptatibus nemo repudiandae alias similique. Harum sed a ab consequatur architecto ex, accusantium tempora quasi eos, eaque corporis. Possimus, veritatis quam. Animi veritatis voluptatibus rem beatae ad quam a cum, culpa sit voluptatum, nobis voluptates officiis temporibus eos vitae, alias sunt fugiat inventore corporis! Quidem sed temporibus tempore saepe voluptas vel nam animi recusandae! Veniam ab magni officia aperiam tenetur necessitatibus distinctio nesciunt, debitis voluptatibus. Sunt impedit temporibus fuga doloribus repellendus illum natus illo ratione officiis, eum, doloremque dignissimos laboriosam eligendi.</p>
                `,
                selected: false,
            }
            Object.assign(element, option);
            elements.push(element);
            return element;

        }
        function createLink(option){
            const link = {
                id: Date.now(),
                from:{
                    element : null,
                    node: null,
                },
                to:{
                    element : null,
                    node: null,
                },
                selected: false,
            }
            Object.assign(link, option);
            links.push(link);
            return link;
        }
        function createLinkRelation(element,node, newElement,newNode){
           const newLink =  createLink();
           newLink.from.element = element;
           newLink.from.node = node;
           newLink.to.element = newElement;
           newLink.to.node = newNode;
           node.linkId = newLink.id;
           newNode.linkId = newLink.id;

        }
        function createRelation(element,node){
            if(node.linkId) return;
            const newElement = createElement({
                    id: Date.now(),
                    x: element.x + newCoordinate[node.id].x,
                    y: element.y + newCoordinate[node.id].y,
            })
            let newNode = newElement.nodes.find((n) => n.id == correlation[node.id]);
            createLinkRelation(element,node, newElement,newNode);
        }
        function removeRelation(linkId){
            const link = links.find((link) =>link.id == linkId);
            const fromElement = elements.find((element)=> element.id == link.from.element.id);
            const fromNode = fromElement.nodes.find((node)=> node.id == link.from.node.id);
            const toElement = elements.find((element)=> element.id == link.to.element.id);
            const toNode = toElement.nodes.find((node)=> node.id == link.to.node.id);
            //reset the node linkid to null
            fromNode.linkId = null;
            toNode.linkId = null;

            // remove the link
            const indexLink = links.findIndex((link)=>link.id == linkId);
            links.splice(indexLink, 1);
        }
        function removeElement(element){
            const index = elements.findIndex((e) => e.id == element.id);
            // remove relations related to the element
            for(let node of element.nodes){
                if(node.linkId){
                    removeRelation(node.linkId );
                }
            }
            elements.splice(index, 1);

        }
        function deselect(){
            elements.forEach(e=> e.selected = false);
            links.forEach(l=> l.selected = false);
        }
        function select(e){
            deselect();
            e.selected = true

        }
        const initialState = reactive([]);
        function clear(){
            elements.splice(0,elements.length);
            links.splice(0,links.length);
            createElement({id: 'root'});
            window.location.reload();
        }
        // pass function or state down to ancestors
        provide('createRelation', createRelation);
        provide('createLinkRelation', createLinkRelation);
        provide('removeRelation', removeRelation);
        provide('newCoordinate', newCoordinate);
        provide('removeElement', removeElement);
        provide('select', select);
        provide('deselect', deselect);
        provide('clear', clear);
        provide('mode', mode);

        return{
            mode,
            elements,
            links,
        }
    }
})
app.mount('#app');