describe('Utils', () => {
	describe('getHostDirsFromURI', () => {
		it('localhost without port', () => {
			let hosts = getHostDirsFromURI('http://localhost/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'localhost', 'localhost:80']);
			hosts = getHostDirsFromURI('https://localhost/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'localhost', 'localhost:443']);
			hosts = getHostDirsFromURI('ftp://localhost/');
			expect(hosts).toEqual(['ALL_ftp', 'localhost', 'localhost:21']);
		});
		it('localhost with port', () => {
			let hosts = getHostDirsFromURI('http://localhost:8080/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'localhost', 'localhost:8080']);
			hosts = getHostDirsFromURI('https://localhost:8080/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'localhost', 'localhost:8080']);
			hosts = getHostDirsFromURI('ftp://localhost:8080/');
			expect(hosts).toEqual(['ALL_ftp', 'localhost', 'localhost:8080']);
		});
		it('example.org without port', () => {
			let hosts = getHostDirsFromURI('http://example.org/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'org', 'org:80', 'example.org', 'example.org:80']);
			hosts = getHostDirsFromURI('https://example.org/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'org', 'org:443', 'example.org', 'example.org:443']);
			hosts = getHostDirsFromURI('ftp://example.org/');
			expect(hosts).toEqual(['ALL_ftp', 'org', 'org:21', 'example.org', 'example.org:21']);
		});
		it('example.org with port', () => {
			let hosts = getHostDirsFromURI('http://example.org:8080/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'org', 'org:8080', 'example.org', 'example.org:8080']);
			hosts = getHostDirsFromURI('https://example.org:8080/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'org', 'org:8080', 'example.org', 'example.org:8080']);
			hosts = getHostDirsFromURI('ftp://example.org:8080/');
			expect(hosts).toEqual(['ALL_ftp', 'org', 'org:8080', 'example.org', 'example.org:8080']);
		});
		it('dot.page.mod.example.com', () => {
			let hosts = getHostDirsFromURI('http://dot.page.mod.example.com/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'com', 'com:80', 'example.com', 'example.com:80', 'mod.example.com', 'mod.example.com:80', 'page.mod.example.com', 'page.mod.example.com:80', 'dot.page.mod.example.com', 'dot.page.mod.example.com:80']);
			hosts = getHostDirsFromURI('https://dot.page.mod.example.com/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'com', 'com:443', 'example.com', 'example.com:443', 'mod.example.com', 'mod.example.com:443', 'page.mod.example.com', 'page.mod.example.com:443', 'dot.page.mod.example.com', 'dot.page.mod.example.com:443']);
			hosts = getHostDirsFromURI('ftp://dot.page.mod.example.com/');
			expect(hosts).toEqual(['ALL_ftp', 'com', 'com:21', 'example.com', 'example.com:21', 'mod.example.com', 'mod.example.com:21', 'page.mod.example.com', 'page.mod.example.com:21', 'dot.page.mod.example.com', 'dot.page.mod.example.com:21']);
		});
		it('file uri', () => {
			let hosts = getHostDirsFromURI('file:///nonexistent/path/');
			expect(hosts).toEqual(['ALL_file']);
		});
	});
});
