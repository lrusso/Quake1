Draw = {};

Draw.CharToConback = function(num, dest)
{
	var source = ((num >> 4) << 10) + ((num & 15) << 3);
	var drawline, x;
	for (drawline = 0; drawline < 8; ++drawline)
	{
		for (x = 0; x < 8; ++x)
		{
			if (Draw.chars[source + x] !== 0)
				Draw.conback.data[dest + x] = 0x60 + Draw.chars[source + x];
		}
		source += 128;
		dest += 320;
	}
};

Draw.Init = function()
{
	var i;

	Draw.chars = new Uint8Array(W.GetLumpName('CONCHARS'));
	
	var trans = new ArrayBuffer(65536);
	var trans32 = new Uint32Array(trans);
	for (i = 0; i < 16384; ++i)
	{
		if (Draw.chars[i] !== 0)
			trans32[i] = COM.LittleLong(VID.d_8to24table[Draw.chars[i]] + 0xff000000);
	}
	Draw.char_texture = gl.createTexture();
	GL.Bind(0, Draw.char_texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	Draw.conback = {};
	var cb = COM.LoadFile('gfx/conback.lmp');
	if (cb == null)
		Sys.Error('Couldn\'t load gfx/conback.lmp');
	Draw.conback.width = 320;
	Draw.conback.height = 200;
	Draw.conback.data = new Uint8Array(cb, 8, 64000);
	var ver = '1.09';
	for (i = 0; i < ver.length; ++i)
		Draw.CharToConback(ver.charCodeAt(i), 59829 - ((ver.length - i) << 3), 186);
	Draw.conback.texnum = GL.LoadPicTexture(Draw.conback);

	Draw.loading = Draw.CachePic('loading');
	Draw.loadingElem = document.getElementById('loading');
	Draw.loadingElem.src = 'data:image/png;base64,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';

	document.body.style.backgroundImage = 'url("' + Draw.PicToDataURL(Draw.PicFromWad('BACKTILE')) + '")';

	GL.CreateProgram('Fill',
		['uOrtho'],
		[['aPosition', gl.FLOAT, 2], ['aColor', gl.UNSIGNED_BYTE, 4, true]],
		[]);
	GL.CreateProgram('Pic',
		['uOrtho'],
		[['aPosition', gl.FLOAT, 2], ['aTexCoord', gl.FLOAT, 2]],
		['tTexture']);
	GL.CreateProgram('PicTranslate',
		['uOrtho', 'uTop', 'uBottom'],
		[['aPosition', gl.FLOAT, 2], ['aTexCoord', gl.FLOAT, 2]],
		['tTexture', 'tTrans']);
};

Draw.Char = function(x, y, num)
{
	GL.StreamDrawTexturedQuad(x, y, 8, 8,
		(num & 15) * 0.0625, (num >> 4) * 0.0625,
		((num & 15) + 1) * 0.0625, ((num >> 4) + 1) * 0.0625);
}

Draw.Character = function(x, y, num)
{
	var program = GL.UseProgram('Pic', true);
	GL.Bind(program.tTexture, Draw.char_texture, true);
	Draw.Char(x, y, num);
};

Draw.String = function(x, y, str)
{
	var program = GL.UseProgram('Pic', true);
	GL.Bind(program.tTexture, Draw.char_texture, true);
	for (var i = 0; i < str.length; ++i)
	{
		Draw.Char(x, y, str.charCodeAt(i));
		x += 8;
	}
};

Draw.StringWhite = function(x, y, str)
{
	var program = GL.UseProgram('Pic', true);
	GL.Bind(program.tTexture, Draw.char_texture, true);
	for (var i = 0; i < str.length; ++i)
	{
		Draw.Char(x, y, str.charCodeAt(i) + 128);
		x += 8;
	}
};

Draw.PicFromWad = function(name)
{
	var buf = W.GetLumpName(name);
	var p = {};
	var view = new DataView(buf, 0, 8);
	p.width = view.getUint32(0, true);
	p.height = view.getUint32(4, true);
	p.data = new Uint8Array(buf, 8, p.width * p.height);
	p.texnum = GL.LoadPicTexture(p);
	return p;
};

Draw.CachePic = function(path)
{
	path = 'gfx/' + path + '.lmp';
	var buf = COM.LoadFile(path);
	if (buf == null)
		Sys.Error('Draw.CachePic: failed to load ' + path);
	var dat = {};
	var view = new DataView(buf, 0, 8);
	dat.width = view.getUint32(0, true);
	dat.height = view.getUint32(4, true);
	dat.data = new Uint8Array(buf, 8, dat.width * dat.height);
	dat.texnum = GL.LoadPicTexture(dat);
	return dat;
};

Draw.Pic = function(x, y, pic)
{
	var program = GL.UseProgram('Pic', true);
	GL.Bind(program.tTexture, pic.texnum, true);
	GL.StreamDrawTexturedQuad(x, y, pic.width, pic.height, 0.0, 0.0, 1.0, 1.0);
};

Draw.PicTranslate = function(x, y, pic, top, bottom)
{
	GL.StreamFlush();
	var program = GL.UseProgram('PicTranslate');
	GL.Bind(program.tTexture, pic.texnum);
	GL.Bind(program.tTrans, pic.translate);

	var p = VID.d_8to24table[top];
	var scale = 1.0 / 191.25;
	gl.uniform3f(program.uTop, (p & 0xff) * scale, ((p >> 8) & 0xff) * scale, (p >> 16) * scale);
	p = VID.d_8to24table[bottom];
	gl.uniform3f(program.uBottom, (p & 0xff) * scale, ((p >> 8) & 0xff) * scale, (p >> 16) * scale);

	GL.StreamDrawTexturedQuad(x, y, pic.width, pic.height, 0.0, 0.0, 1.0, 1.0);

	GL.StreamFlush();
};

Draw.ConsoleBackground = function(lines)
{
	var program = GL.UseProgram('Pic', true);
	GL.Bind(program.tTexture, Draw.conback.texnum, true);
	GL.StreamDrawTexturedQuad(0, lines - VID.height, VID.width, VID.height, 0.0, 0.0, 1.0, 1.0);
};

Draw.Fill = function(x, y, w, h, c)
{
	var program = GL.UseProgram('Fill', true);
	var color = VID.d_8to24table[c];
	GL.StreamDrawColoredQuad(x, y, w, h, color & 0xff, (color >> 8) & 0xff, color >> 16, 255);
};

Draw.FadeScreen = function()
{
	var program = GL.UseProgram('Fill', true);
	GL.StreamDrawColoredQuad(0, 0, VID.width, VID.height, 0, 0, 0, 204);
};

Draw.BeginDisc = function()
{
	if (Draw.loadingElem == null)
		return;
	Draw.loadingElem.style.left = ((VID.width - Draw.loading.width) >> 1) + 'px';
	Draw.loadingElem.style.top = ((VID.height - Draw.loading.height) >> 1) + 'px';
	Draw.loadingElem.style.display = 'inline-block';
};

Draw.EndDisc = function()
{
	if (Draw.loadingElem != null)
		Draw.loadingElem.style.display = 'none';
};

Draw.PicToDataURL = function(pic)
{
	var canvas = document.createElement('canvas');
	canvas.width = pic.width;
	canvas.height = pic.height;
	var ctx = canvas.getContext('2d');
	var data = ctx.createImageData(pic.width, pic.height);
	var trans = new ArrayBuffer(data.data.length);
	var trans32 = new Uint32Array(trans);
	var i;
	for (i = 0; i < pic.data.length; ++i)
		trans32[i] = COM.LittleLong(VID.d_8to24table[pic.data[i]] + 0xff000000);
	data.data.set(new Uint8Array(trans));
	ctx.putImageData(data, 0, 0);
	return canvas.toDataURL();
};