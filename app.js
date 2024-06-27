let fs = require('fs')

let sprite_template = `<Sprite
filename="$0"
offset_x="0"
default_animation="stand" >

<!-- animation -->
	<RectAnimation
		name="stand"
		pos_x="$3"
		pos_y="$4"
		frame_count="1"
		frame_width="$5"
		frame_height="$6"
		frame_wait="1"
		frames_per_row="1"
		loop="1"   >
	</RectAnimation>
</Sprite>`

let sprite_entity_template = `<Entity>
  <SpriteComponent 
    image_file="$0" 
    offset_x="0"
    offset_y="1.5"
    update_transform="0"
    update_transform_rotation="0" >
  </SpriteComponent>
</Entity>`

let cosmetic_entity_template = `<Entity name="tail_cosmetic" >
	<InheritTransformComponent
        parent_hotspot_tag="belt_root" >
		<Transform 
			position.x="1.5" 
			position.y="0"
			>
		</Transform>
    </InheritTransformComponent>  
   
    <VerletPhysicsComponent
    	num_points="$0"
    	stiffness="1.2"
		velocity_dampening="0.8"
    	resting_distance="2" 
    	pixelate_sprite_transforms="0"
    	simulate_wind="1"
        wind_change_speed="0.25"
    	simulate_gravity="1"
		constrain_stretching="1"
		collide_with_cells="1"
		>
    </VerletPhysicsComponent>

	$1
</Entity>`

let part_template = `<Base file="$0"/>`

function wrap(value, min, max) {
    let range = max - min + 1;  // Range includes both min and max
    let result = (value - min) % range;  // Shift value by subtracting min

    if (result < 0) {
        result += range;  // Ensure the result is non-negative
    }

    return result + min;  // Shift back by adding min
}

function generate_verlet_entity(image_file, width, height, parts, length){
    // split width into parts
    let part_width = width / parts
    // make sure it is a whole number, if there is pixels left over add it to the last part
    part_width = Math.floor(part_width)
    let remainder = width % parts

    // get file directory path
    let file_path = image_file.split("/")
    // get file name without extension
    let file_name = file_path[file_path.length - 1].split(".")[0]

    let sprite_files = []

    // generate sprite xml files from sprite template
    for(let i = 0; i < parts; i++){
        let x = i * part_width
        let y = 0
        let w = part_width
        let h = height
        if(i == parts - 1){
            w += remainder
        }
        let sprite_xml = sprite_template.replace("$0", image_file).replace("$1", y / 2).replace("$3", x).replace("$4", y).replace("$5", w).replace("$6", h)

        // write to file in the same directory as the image file
        let sprite_file = file_path.slice(0, file_path.length - 1).join("/") + "/" + file_name + "_" + i + ".xml"
        fs.writeFileSync(sprite_file, sprite_xml)
        sprite_files.push(sprite_file)
    }

    // generate part xml files from part template
    let part_files = []
    for(let i = 0; i < parts; i++){
        let part_xml = sprite_entity_template.replace("$0", sprite_files[i])
        let part_file = file_path.slice(0, file_path.length - 1).join("/") + "/" + file_name + "_part_" + i + ".xml"
        fs.writeFileSync(part_file, part_xml)
        part_files.push(part_file)
    }

    // generate entity xml file from entity template, if the length is longer than the parts, add the middle part multiple times, make sure to not do this for the first and last part
    let entity_xml = ""
    entity_xml += part_template.replace("$0", part_files[0])
    for(let i = 1; i < length - 1; i++){
        // get part files from middle parts, excluding the first and last part
        // wrap it around
        let index = wrap(i, 1, part_files.length - 2)


        entity_xml += part_template.replace("$0", part_files[index])
    }
    entity_xml += part_template.replace("$0", part_files[part_files.length - 1])
    let cosmetic_entity = cosmetic_entity_template.replace("$0", length + 1).replace("$1", entity_xml)
    let entity_file = file_path.slice(0, file_path.length - 1).join("/") + "/" + file_name + ".xml"
    fs.writeFileSync(entity_file, cosmetic_entity)
}


let images = [
    ["mods/evaisa.arena/content/cosmetics/entities/cat_tail/tail_white.png", 5, 3, 5, 5], // cats
    ["mods/evaisa.arena/content/cosmetics/entities/cat_tail/tail_black.png", 5, 3, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/cat_tail/tail_blue.png", 5, 3, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/cat_tail/tail_green.png", 5, 3, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/cat_tail/tail_pink.png", 5, 3, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/cat_tail/tail_red.png", 5, 3, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/cat_tail/tail_black_white_tip.png", 5, 3, 5, 5],

    ["mods/evaisa.arena/content/cosmetics/entities/wolf_tail/regular.png", 10, 4, 5, 5], // wolves
    ["mods/evaisa.arena/content/cosmetics/entities/wolf_tail/blue.png", 10, 4, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/wolf_tail/pink.png", 10, 4, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/wolf_tail/white.png", 10, 4, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/wolf_tail/orange.png", 12, 4, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/wolf_tail/rainbow.png", 12, 4, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/wolf_tail/black_white_tip.png", 12, 4, 5, 5],

    ["mods/evaisa.arena/content/cosmetics/entities/misc_tail/lizard.png", 20, 4, 10, 10], // lizard

    ["mods/evaisa.arena/content/cosmetics/entities/misc_tail/fox.png", 12, 4, 5, 5], // fox
    ["mods/evaisa.arena/content/cosmetics/entities/misc_tail/fox_silver.png", 12, 4, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/misc_tail/fox_spotted.png", 12, 4, 5, 5],
    ["mods/evaisa.arena/content/cosmetics/entities/misc_tail/fox_white.png", 12, 4, 5, 5],

    ["mods/evaisa.arena/content/cosmetics/entities/misc_tail/raccoon.png", 12, 4, 5, 5], // raccoon 
    
]

images.forEach(image => {
    generate_verlet_entity(...image)
})